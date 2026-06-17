import { now, sha256Hex } from "../tokens";
import type { Env } from "../types";
import { jsonError } from "./helpers";

/**
 * GET /verify?token=… を SPA に渡さず Worker で完結させる。
 * - 検証成功: email_verified を立てて /signin?email=…&verified=1 に 302
 * - 失効：/signup に 302（design は失効画面を別途定義しているが、v1 では再作成へ）
 */
export async function handleVerify(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "GET") {
		return jsonError(405, "method not allowed");
	}

	const url = new URL(request.url);
	const token = url.searchParams.get("token");
	if (!token) {
		return Response.redirect(new URL("/signup", url).href, 302);
	}

	const tokenHash = await sha256Hex(token);
	const row = await env.DB.prepare(
		"SELECT user_id, expires_at, used_at FROM email_verification_tokens WHERE token_hash = ?",
	)
		.bind(tokenHash)
		.first<{ user_id: string; expires_at: number; used_at: number | null }>();

	if (!row || row.expires_at < now() || row.used_at != null) {
		const next = new URL("/signup", url);
		next.searchParams.set("expired", "1");
		return Response.redirect(next.href, 302);
	}

	const userId = row.user_id;
	const t = now();
	// 1 トランザクションで「フラグを立て」「トークンを使用済みにする」
	await env.DB.batch([
		env.DB.prepare(
			"UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?",
		).bind(t, userId),
		env.DB.prepare(
			"UPDATE email_verification_tokens SET used_at = ? WHERE token_hash = ?",
		).bind(t, tokenHash),
	]);

	const user = await env.DB.prepare("SELECT email FROM users WHERE id = ?")
		.bind(userId)
		.first<{ email: string }>();

	const next = new URL("/signin", url);
	if (user?.email) next.searchParams.set("email", user.email);
	next.searchParams.set("verified", "1");
	return Response.redirect(next.href, 302);
}
