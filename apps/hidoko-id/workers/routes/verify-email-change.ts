import { now, sha256Hex } from "../tokens";
import type { Env } from "../types";

/**
 * GET /verify-email-change?token=…
 * メールアドレス変更の確認リンク。トークンを原子的に消費し、users.email を新しい
 * アドレスに切り替える。完了したら /account に redirect する。
 */
export async function handleVerifyEmailChange(
	request: Request,
	env: Env,
): Promise<Response> {
	const url = new URL(request.url);
	const token = url.searchParams.get("token");
	if (!token) {
		return Response.redirect(
			new URL("/account?email_change=missing_token", url).href,
			302,
		);
	}

	const tokenHash = await sha256Hex(token);
	const t = now();

	// 検証 + 消費を 1 UPDATE で。期限切れ / 使用済み / 不存在は全部 null。
	const claimed = await env.DB.prepare(
		"UPDATE email_change_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at >= ? RETURNING user_id, new_email",
	)
		.bind(t, tokenHash, t)
		.first<{ user_id: string; new_email: string }>();

	if (!claimed) {
		return Response.redirect(
			new URL("/account?email_change=expired", url).href,
			302,
		);
	}

	// 一意制約に引っかかったら（その間に別ユーザーがそのメールを取った）失敗扱い。
	try {
		await env.DB.prepare(
			"UPDATE users SET email = ?, email_verified = 1, updated_at = ? WHERE id = ?",
		)
			.bind(claimed.new_email, t, claimed.user_id)
			.run();
	} catch (err) {
		console.error("[hidoko-id] email change apply failed", err);
		return Response.redirect(
			new URL("/account?email_change=taken", url).href,
			302,
		);
	}

	return Response.redirect(new URL("/account?email_change=ok", url).href, 302);
}
