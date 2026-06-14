import { newId, now, sha256Hex } from "./tokens";
import type { Env } from "./types";

export const SESSION_COOKIE = "hidoko_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 日

export interface SessionUser {
	id: string;
	email: string;
	emailVerified: boolean;
}

interface SessionRow {
	id: string;
	user_id: string;
	expires_at: number;
}

/**
 * 新しいセッションを発行し、cookie 用の文字列も返す。
 * セッション ID は乱数を SHA-256 ハッシュしたものを DB に保存し、cookie には平文を載せる。
 */
export async function createSession(
	env: Env,
	userId: string,
): Promise<{ token: string; cookie: string }> {
	const token = `${newId()}.${crypto.randomUUID().replace(/-/g, "")}`;
	const id = await sha256Hex(token);
	const expiresAt = now() + SESSION_TTL_MS;
	await env.DB.prepare(
		"INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
	)
		.bind(id, userId, now(), expiresAt)
		.run();
	const cookie = serializeSessionCookie(env, token, expiresAt);
	return { token, cookie };
}

/** セッション cookie を消すための `Set-Cookie` 値。 */
export function clearSessionCookie(env: Env): string {
	return serializeSessionCookie(env, "", 0, true);
}

function serializeSessionCookie(
	env: Env,
	value: string,
	expiresAt: number,
	clear = false,
): string {
	const parts = [
		`${SESSION_COOKIE}=${value}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
	];
	if (env.SESSION_COOKIE_DOMAIN) {
		parts.push(`Domain=${env.SESSION_COOKIE_DOMAIN}`);
	}
	// 本番（https）でだけ Secure を付ける。dev は SESSION_COOKIE_DOMAIN が空なので Secure も外す。
	if (env.SESSION_COOKIE_DOMAIN) {
		parts.push("Secure");
	}
	if (clear) {
		parts.push("Max-Age=0");
	} else {
		const maxAge = Math.max(1, Math.floor((expiresAt - now()) / 1000));
		parts.push(`Max-Age=${maxAge}`);
	}
	return parts.join("; ");
}

/** Cookie ヘッダから session token を取り出す。 */
export function readSessionToken(request: Request): string | null {
	const cookie = request.headers.get("cookie");
	if (!cookie) return null;
	for (const part of cookie.split(";")) {
		const eq = part.indexOf("=");
		if (eq < 0) continue;
		const k = part.slice(0, eq).trim();
		if (k !== SESSION_COOKIE) continue;
		const v = part.slice(eq + 1).trim();
		return v || null;
	}
	return null;
}

/** トークンから現在のセッション・ユーザーを引く。期限切れなら null。 */
export async function loadSession(
	env: Env,
	token: string | null,
): Promise<SessionUser | null> {
	if (!token) return null;
	const id = await sha256Hex(token);
	const row = await env.DB.prepare(
		"SELECT id, user_id, expires_at FROM sessions WHERE id = ?",
	)
		.bind(id)
		.first<SessionRow>();
	if (!row) return null;
	if (row.expires_at < now()) {
		// 期限切れはここで掃除する
		await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
		return null;
	}
	const user = await env.DB.prepare(
		"SELECT id, email, email_verified FROM users WHERE id = ?",
	)
		.bind(row.user_id)
		.first<{ id: string; email: string; email_verified: number }>();
	if (!user) return null;
	return {
		id: user.id,
		email: user.email,
		emailVerified: user.email_verified === 1,
	};
}

/** セッションを失効させる（サインアウト）。 */
export async function destroySession(
	env: Env,
	token: string | null,
): Promise<void> {
	if (!token) return;
	const id = await sha256Hex(token);
	await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
}
