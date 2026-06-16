// アカウント設定（#204 phase 1）用の API。
// すべて認証必須で、未認証は 401 + クライアントが /signin にリダイレクトする想定。

import {
	currentSessionId,
	loadSession,
	readSessionToken,
	type SessionUser,
} from "../session";
import type { Env } from "../types";
import { jsonError, jsonOk } from "./helpers";

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
