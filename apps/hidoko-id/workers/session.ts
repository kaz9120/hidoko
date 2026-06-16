import { newId, now, sha256Hex } from "./tokens";
import type { Env } from "./types";

export const SESSION_COOKIE = "hidoko_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 日

export interface SessionUser {
	id: string;
	email: string;
	emailVerified: boolean;
	displayName: string | null;
	avatarUrl: string | null;
}

interface SessionRow {
	id: string;
	user_id: string;
	expires_at: number;
}

/**
 * リクエストから user_agent と IP を取り出す（保存時の追加情報用）。
 * Cloudflare 経由なら CF-Connecting-IP が真の IP。dev のみ X-Forwarded-For 等にフォールバック。
 */
function extractClientMeta(request: Request): {
	userAgent: string | null;
	ip: string | null;
} {
	const userAgent = request.headers.get("user-agent") || null;
	const ip =
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		null;
	return { userAgent, ip };
}

/**
 * 新しいセッションを発行し、cookie 用の文字列も返す。
 * セッション ID は乱数を SHA-256 ハッシュしたものを DB に保存し、cookie には平文を載せる。
 */
export async function createSession(
	env: Env,
	userId: string,
	request?: Request,
): Promise<{ token: string; cookie: string }> {
	const token = `${newId()}.${crypto.randomUUID().replace(/-/g, "")}`;
	const id = await sha256Hex(token);
	const t = now();
	const expiresAt = t + SESSION_TTL_MS;
	const meta = request
		? extractClientMeta(request)
		: { userAgent: null, ip: null };
	await env.DB.prepare(
		"INSERT INTO sessions (id, user_id, created_at, expires_at, user_agent, ip, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
	)
		.bind(id, userId, t, expiresAt, meta.userAgent, meta.ip, t)
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

/**
 * トークンから現在のセッション・ユーザーを引く。期限切れなら null。
 * 読み出すついでに last_seen_at をたまに更新したいが、毎リクエスト書き込みは
 * D1 負荷になるので 5 分以上経っている時だけ touch する。
 */
export async function loadSession(
	env: Env,
	token: string | null,
): Promise<SessionUser | null> {
	if (!token) return null;
	const id = await sha256Hex(token);
	const row = await env.DB.prepare(
		"SELECT id, user_id, expires_at, last_seen_at FROM sessions WHERE id = ?",
	)
		.bind(id)
		.first<SessionRow & { last_seen_at: number | null }>();
	if (!row) return null;
	const t = now();
	if (row.expires_at < t) {
		// 期限切れはここで掃除する
		await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
		return null;
	}
	const user = await env.DB.prepare(
		"SELECT id, email, email_verified, display_name, avatar_url FROM users WHERE id = ?",
	)
		.bind(row.user_id)
		.first<{
			id: string;
			email: string;
			email_verified: number;
			display_name: string | null;
			avatar_url: string | null;
		}>();
	if (!user) return null;
	// 5 分以上経っていれば last_seen_at を更新（書き込み頻度の節約）。
	if (!row.last_seen_at || t - row.last_seen_at > 5 * 60 * 1000) {
		await env.DB.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?")
			.bind(t, id)
			.run();
	}
	return {
		id: user.id,
		email: user.email,
		emailVerified: user.email_verified === 1,
		displayName: user.display_name,
		avatarUrl: user.avatar_url,
	};
}

/** 現在のセッションの sha256 ID（自セッションを判別したいときに使う）。 */
export async function currentSessionId(
	token: string | null,
): Promise<string | null> {
	if (!token) return null;
	return sha256Hex(token);
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
