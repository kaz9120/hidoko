import { sendPasswordResetEmail } from "../email";
import { hashPassword } from "../password";
import { newId, now, randomToken, sha256Hex } from "../tokens";
import type { Env } from "../types";
import { jsonError, jsonOk, readJson } from "./helpers";

const RESET_TTL_MS = 24 * 60 * 60 * 1000;

interface RequestBody {
	email?: string;
}

interface ConfirmBody {
	token?: string;
	password?: string;
}

/**
 * POST /api/reset/request
 * メールに再設定リンクを送る。enumeration 防止のため、ユーザーが存在しても
 * しなくても同じレスポンスを返す（dev fallback の `devResetUrl` のみ差が出る）。
 */
export async function handleResetRequest(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "POST") {
		return jsonError(405, "method not allowed");
	}

	const body = await readJson<RequestBody>(request);
	if (!body) return jsonError(400, "リクエストボディが不正", "bad_json");

	const email = (body.email ?? "").trim().toLowerCase();
	if (!isEmailLike(email)) {
		return jsonError(400, "メールアドレスの形式が正しくない", "invalid_email");
	}

	const user = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
		.bind(email)
		.first<{ id: string }>();

	// dev fallback 用に reset URL も準備するが、enumeration 防止のため
	// ユーザー不在時はサーバー側で送信しない（クライアントには成功を返す）。
	const t = now();
	let devResetUrl: string | undefined;

	if (user) {
		// 既存の未使用トークンは捨てる（メール内リンクは常に「最新の 1 つ」だけ有効）。
		await env.DB.prepare(
			"DELETE FROM password_reset_tokens WHERE user_id = ? AND used_at IS NULL",
		)
			.bind(user.id)
			.run();

		const token = randomToken();
		const tokenHash = await sha256Hex(token);
		await env.DB.prepare(
			"INSERT INTO password_reset_tokens (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
		)
			.bind(tokenHash, user.id, t, t + RESET_TTL_MS)
			.run();

		const baseUrl = env.PUBLIC_BASE_URL || new URL(request.url).origin;
		const resetUrl = `${baseUrl}/reset/new?token=${encodeURIComponent(token)}`;

		const sendResult = await sendPasswordResetEmail(env, {
			to: email,
			resetUrl,
		});
		devResetUrl = sendResult.devUrl;
	} else {
		// ユーザー不在時もダミー sha256 を 1 回走らせて応答時間を揃える。
		await sha256Hex(`reset:${email}:${newId()}`);
	}

	return jsonOk({
		email,
		...(devResetUrl ? { devResetUrl } : {}),
	});
}

/**
 * POST /api/reset/confirm
 * メール内リンクから渡されたトークンと新パスワードでパスワードを更新する。
 * 成功すると、念のためそのユーザーの既存セッションは全削除する。
 */
export async function handleResetConfirm(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "POST") {
		return jsonError(405, "method not allowed");
	}

	const body = await readJson<ConfirmBody>(request);
	if (!body) return jsonError(400, "リクエストボディが不正", "bad_json");

	const token = body.token ?? "";
	const password = body.password ?? "";
	if (!token) {
		return jsonError(400, "再設定トークンが必要", "missing_token");
	}
	if (!validatePassword(password)) {
		return jsonError(
			400,
			"パスワードは英数字を含む 12 文字以上が必要",
			"invalid_password",
		);
	}

	const tokenHash = await sha256Hex(token);
	const row = await env.DB.prepare(
		"SELECT user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?",
	)
		.bind(tokenHash)
		.first<{ user_id: string; expires_at: number; used_at: number | null }>();

	if (!row || row.used_at != null || row.expires_at < now()) {
		return jsonError(
			410,
			"このリンクは使えない。最初からやり直す",
			"token_expired",
		);
	}

	const passwordHash = await hashPassword(password);
	const t = now();
	// パスワード更新、トークン消費、既存セッション全削除を 1 トランザクションで。
	// 他端末からは強制サインアウトされる（design の Done 条件）。
	await env.DB.batch([
		env.DB.prepare(
			"UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
		).bind(passwordHash, t, row.user_id),
		env.DB.prepare(
			"UPDATE password_reset_tokens SET used_at = ? WHERE token_hash = ?",
		).bind(t, tokenHash),
		env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(row.user_id),
	]);

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
