// アカウント設定（#204 phase 1 / 2）用の API。
// すべて認証必須で、未認証は 401 + クライアントが /signin にリダイレクトする想定。

import { sendEmailChangeNotice, sendEmailChangeVerification } from "../email";
import { hashPassword, verifyPassword } from "../password";
import {
	currentSessionId,
	loadSession,
	readSessionToken,
	type SessionUser,
} from "../session";
import { now, randomToken, sha256Hex } from "../tokens";
import type { Env } from "../types";
import { jsonError, jsonOk, readJson } from "./helpers";

const EMAIL_CHANGE_TTL_MS = 24 * 60 * 60 * 1000;
// パスワードを持たない Google 専用ユーザーの sentinel ハッシュ。verifyPassword は
// この prefix を未知扱いで false にするので、メール+パスワード経路では弾かれる。
const EXTERNAL_ONLY_PASSWORD_HASH = "external$google";

interface SessionRecord {
	id: string;
	created_at: number;
	expires_at: number;
	user_agent: string | null;
	ip: string | null;
	last_seen_at: number | null;
}

/** 認証ガード。Worker route 内で「ログイン状態であること」を担保する。 */
async function requireUser(
	request: Request,
	env: Env,
): Promise<{ user: SessionUser; sessionId: string } | Response> {
	const token = readSessionToken(request);
	const user = await loadSession(env, token);
	if (!user || !token) {
		return jsonError(401, "サインインが必要", "unauthenticated");
	}
	const sessionId = await currentSessionId(token);
	if (!sessionId) {
		return jsonError(401, "サインインが必要", "unauthenticated");
	}
	return { user, sessionId };
}

/**
 * GET /api/me
 * 現在のユーザー情報を返す。SPA が /account レイアウト初期化時に呼ぶ。
 */
export async function handleMe(request: Request, env: Env): Promise<Response> {
	if (request.method !== "GET") {
		return jsonError(405, "method not allowed");
	}
	const guard = await requireUser(request, env);
	if (guard instanceof Response) return guard;
	const { user } = guard;
	return jsonOk({
		user: {
			id: user.id,
			email: user.email,
			emailVerified: user.emailVerified,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
		},
	});
}

/**
 * GET /api/sessions
 * 自分のセッション一覧（作成日時 / 期限 / 端末 / IP / 最終アクセス）。
 * `isCurrent` フラグで「いま開いている端末」を区別できるようにする。
 */
export async function handleListSessions(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "GET") {
		return jsonError(405, "method not allowed");
	}
	const guard = await requireUser(request, env);
	if (guard instanceof Response) return guard;
	const { user, sessionId } = guard;

	const rows = await env.DB.prepare(
		"SELECT id, created_at, expires_at, user_agent, ip, last_seen_at FROM sessions WHERE user_id = ? ORDER BY last_seen_at DESC NULLS LAST, created_at DESC",
	)
		.bind(user.id)
		.all<SessionRecord>();

	const sessions = rows.results.map((r) => ({
		id: r.id,
		createdAt: r.created_at,
		expiresAt: r.expires_at,
		lastSeenAt: r.last_seen_at,
		userAgent: r.user_agent,
		ip: r.ip,
		isCurrent: r.id === sessionId,
	}));

	return jsonOk({ sessions });
}

/**
 * POST /api/sessions/:id/revoke
 * 指定セッションを失効。自セッションも対象にできるが、その場合は signin に戻る挙動を
 * クライアント側で起こす（cookie の Set-Cookie でのクリアはしない、明示的な signout 経路がある）。
 */
export async function handleRevokeSession(
	request: Request,
	env: Env,
	sessionToRevoke: string,
): Promise<Response> {
	if (request.method !== "POST") {
		return jsonError(405, "method not allowed");
	}
	const guard = await requireUser(request, env);
	if (guard instanceof Response) return guard;
	const { user } = guard;

	// 他人の session_id を消せないよう、user_id でしか弾けない（id はランダムだから列挙は
	// 難しいが、念のため）。WHERE id = ? AND user_id = ?。
	const result = await env.DB.prepare(
		"DELETE FROM sessions WHERE id = ? AND user_id = ?",
	)
		.bind(sessionToRevoke, user.id)
		.run();

	if (!result.meta.changes) {
		return jsonError(404, "対象のセッションが見つからない", "not_found");
	}
	return jsonOk({});
}

/**
 * POST /api/sessions/revoke-others
 * 現在のセッション以外を全部失効。パスワード変更後の他端末ログアウトをユーザーが手動で
 * 起こしたい場合や、「ぜんぶサインアウト」ボタンの実装に使う。
 */
export async function handleRevokeOtherSessions(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "POST") {
		return jsonError(405, "method not allowed");
	}
	const guard = await requireUser(request, env);
	if (guard instanceof Response) return guard;
	const { user, sessionId } = guard;

	const result = await env.DB.prepare(
		"DELETE FROM sessions WHERE user_id = ? AND id != ?",
	)
		.bind(user.id, sessionId)
		.run();

	return jsonOk({ revoked: result.meta.changes ?? 0 });
}

interface ProfileBody {
	displayName?: string | null;
	avatarUrl?: string | null;
}

/**
 * PATCH /api/account
 * 表示名・アバター URL を更新する。空文字は null として扱い、未設定状態に戻せる。
 */
export async function handleUpdateProfile(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "PATCH") {
		return jsonError(405, "method not allowed");
	}
	const guard = await requireUser(request, env);
	if (guard instanceof Response) return guard;
	const { user } = guard;

	const body = await readJson<ProfileBody>(request);
	if (!body) return jsonError(400, "リクエストボディが不正", "bad_json");

	const displayName = normalizeOptionalString(body.displayName, 60);
	const avatarUrl = normalizeAvatarUrl(body.avatarUrl);
	if (avatarUrl === undefined) {
		return jsonError(400, "アバター URL の形式が不正", "invalid_avatar");
	}

	const t = now();
	await env.DB.prepare(
		"UPDATE users SET display_name = ?, avatar_url = ?, updated_at = ? WHERE id = ?",
	)
		.bind(displayName, avatarUrl, t, user.id)
		.run();

	return jsonOk({
		user: {
			id: user.id,
			email: user.email,
			emailVerified: user.emailVerified,
			displayName,
			avatarUrl,
		},
	});
}

interface PasswordBody {
	currentPassword?: string;
	newPassword?: string;
}

/**
 * POST /api/account/password
 * パスワード変更。既存パスワード持ち→旧パスワード確認、Google 専用ユーザー→
 * 初回設定として旧パスワード不要。成功時に他セッションを全失効する。
 */
export async function handleChangePassword(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "POST") {
		return jsonError(405, "method not allowed");
	}
	const guard = await requireUser(request, env);
	if (guard instanceof Response) return guard;
	const { user, sessionId } = guard;

	const body = await readJson<PasswordBody>(request);
	if (!body) return jsonError(400, "リクエストボディが不正", "bad_json");

	const newPassword = body.newPassword ?? "";
	if (!validatePassword(newPassword)) {
		return jsonError(
			400,
			"パスワードは英数字を含む 12 文字以上が必要",
			"invalid_password",
		);
	}

	const row = await env.DB.prepare(
		"SELECT password_hash FROM users WHERE id = ?",
	)
		.bind(user.id)
		.first<{ password_hash: string }>();
	if (!row) return jsonError(401, "サインインが必要", "unauthenticated");

	const hasRealPassword = row.password_hash !== EXTERNAL_ONLY_PASSWORD_HASH;
	if (hasRealPassword) {
		const currentPassword = body.currentPassword ?? "";
		if (!currentPassword) {
			return jsonError(
				400,
				"現在のパスワードが必要",
				"current_password_required",
			);
		}
		const ok = await verifyPassword(currentPassword, row.password_hash);
		if (!ok) {
			return jsonError(
				401,
				"現在のパスワードが違う",
				"current_password_mismatch",
			);
		}
	}

	const newHash = await hashPassword(newPassword);
	const t = now();
	// 他端末は全失効（current session だけ残す）。design の Done 条件に従う。
	await env.DB.batch([
		env.DB.prepare(
			"UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
		).bind(newHash, t, user.id),
		env.DB.prepare("DELETE FROM sessions WHERE user_id = ? AND id != ?").bind(
			user.id,
			sessionId,
		),
	]);

	return jsonOk({});
}

interface EmailChangeBody {
	newEmail?: string;
}

/**
 * POST /api/account/email
 * 新メール宛に確認リンクを送る。旧メールにも通知（変更申請があったこと）を送る。
 * リンクが踏まれるまで users.email は変わらない。
 */
export async function handleRequestEmailChange(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "POST") {
		return jsonError(405, "method not allowed");
	}
	const guard = await requireUser(request, env);
	if (guard instanceof Response) return guard;
	const { user } = guard;

	const body = await readJson<EmailChangeBody>(request);
	if (!body) return jsonError(400, "リクエストボディが不正", "bad_json");

	const newEmail = (body.newEmail ?? "").trim().toLowerCase();
	if (!isEmailLike(newEmail)) {
		return jsonError(400, "メールアドレスの形式が正しくない", "invalid_email");
	}
	if (newEmail === user.email) {
		return jsonError(400, "新しいメールが現在と同じ", "email_unchanged");
	}
	// 取られているメールには付け替えない（既存ユーザーへの衝突防止）。
	const conflict = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
		.bind(newEmail)
		.first<{ id: string }>();
	if (conflict) {
		return jsonError(409, "そのメールは既に使われている", "email_taken");
	}

	const token = randomToken();
	const tokenHash = await sha256Hex(token);
	const t = now();

	// 既存の未使用トークンを潰してから新規。partial unique index も併用。
	await env.DB.batch([
		env.DB.prepare(
			"DELETE FROM email_change_tokens WHERE user_id = ? AND used_at IS NULL",
		).bind(user.id),
		env.DB.prepare(
			"INSERT INTO email_change_tokens (token_hash, user_id, new_email, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
		).bind(tokenHash, user.id, newEmail, t, t + EMAIL_CHANGE_TTL_MS),
	]);

	const baseUrl = env.PUBLIC_BASE_URL || new URL(request.url).origin;
	const verifyUrl = `${baseUrl}/verify-email-change?token=${encodeURIComponent(token)}`;

	let devVerifyUrl: string | undefined;
	try {
		const sendResult = await sendEmailChangeVerification(env, {
			to: newEmail,
			verifyUrl,
			currentEmail: user.email,
		});
		devVerifyUrl = sendResult.devUrl;
	} catch (err) {
		console.error("[hidoko-id] email change verification send failed", err);
	}

	// 旧メールにも通知（リンクなし）。送信失敗はログだけ。
	try {
		await sendEmailChangeNotice(env, {
			to: user.email,
			newEmail,
		});
	} catch (err) {
		console.error("[hidoko-id] email change notice send failed", err);
	}

	return jsonOk({
		newEmail,
		...(devVerifyUrl ? { devVerifyUrl } : {}),
	});
}

interface DeleteBody {
	confirmEmail?: string;
}

/**
 * DELETE /api/account
 * アカウントを削除する。確認のため body.confirmEmail に自分のメールアドレスを入れる
 * 必要がある（タイポ防止のリチュアル）。CASCADE で identities / sessions /
 * 各種 tokens / oauth_state は連動して消える。
 */
export async function handleDeleteAccount(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "DELETE") {
		return jsonError(405, "method not allowed");
	}
	const guard = await requireUser(request, env);
	if (guard instanceof Response) return guard;
	const { user } = guard;

	const body = await readJson<DeleteBody>(request);
	if (!body) return jsonError(400, "リクエストボディが不正", "bad_json");

	const confirmEmail = (body.confirmEmail ?? "").trim().toLowerCase();
	if (confirmEmail !== user.email) {
		return jsonError(
			400,
			"確認のため現在のメールアドレスをそのまま入力する",
			"confirm_email_mismatch",
		);
	}

	await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user.id).run();

	return jsonOk({});
}

function isEmailLike(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
	if (password.length < 12) return false;
	if (!/[A-Za-z]/.test(password)) return false;
	if (!/\d/.test(password)) return false;
	return true;
}

function normalizeOptionalString(
	raw: string | null | undefined,
	maxLen: number,
): string | null {
	if (raw == null) return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	return trimmed.slice(0, maxLen);
}

/**
 * アバター URL のホワイトリスト。`https:` のみ受け入れ、それ以外（javascript:、
 * data: 等）は弾く。空文字は null として扱う。
 */
function normalizeAvatarUrl(
	raw: string | null | undefined,
): string | null | undefined {
	if (raw == null) return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	let url: URL;
	try {
		url = new URL(trimmed);
	} catch {
		return undefined;
	}
	if (url.protocol !== "https:") return undefined;
	return url.toString();
}
