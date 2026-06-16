import {
	DUMMY_PASSWORD_HASH,
	hashPassword,
	needsRehash,
	verifyPassword,
} from "../password";
import { isAllowedReturnTo } from "../return-to";
import { createSession } from "../session";
import { now } from "../tokens";
import type { Env } from "../types";
import { jsonError, jsonOk, readJson } from "./helpers";

interface SigninBody {
	email?: string;
	password?: string;
	returnTo?: string;
}

export async function handleSignin(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "POST") {
		return jsonError(405, "method not allowed");
	}

	const body = await readJson<SigninBody>(request);
	if (!body) return jsonError(400, "リクエストボディが不正", "bad_json");

	const email = (body.email ?? "").trim().toLowerCase();
	const password = body.password ?? "";
	if (!email || !password) {
		return jsonError(400, "メールとパスワードが必要", "missing_fields");
	}

	const user = await env.DB.prepare(
		"SELECT id, email, email_verified, password_hash FROM users WHERE email = ?",
	)
		.bind(email)
		.first<{
			id: string;
			email: string;
			email_verified: number;
			password_hash: string;
		}>();

	// メール／パスワードどちらが違ったかは漏らさない（design のエラー文言とも一致）。
	if (!user) {
		// タイミング攻撃緩和：ハッシュ計算を 1 回走らせて応答時間を揃える。
		await verifyPassword(password, DUMMY_PASSWORD_HASH);
		return jsonError(
			401,
			"メールまたはパスワードが違う",
			"invalid_credentials",
		);
	}

	const ok = await verifyPassword(password, user.password_hash);
	if (!ok) {
		return jsonError(
			401,
			"メールまたはパスワードが違う",
			"invalid_credentials",
		);
	}

	// 旧形式（pbkdf2）や弱いパラメータの scrypt は、認証成功時に現行アルゴリズムへ
	// 透過マイグレーションする。失敗してもサインインは続行する（次回もう一度試す）。
	if (needsRehash(user.password_hash)) {
		try {
			const newHash = await hashPassword(password);
			await env.DB.prepare(
				"UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
			)
				.bind(newHash, now(), user.id)
				.run();
		} catch (err) {
			console.error("[hidoko-id] password rehash failed", err);
		}
	}

	if (user.email_verified !== 1) {
		// 未確認なら verify-email へ。今のところセッションは発行しない（メール確認まで）。
		const params = new URLSearchParams({ email: user.email });
		return jsonOk(
			{
				redirectTo: `/verify-email?${params.toString()}`,
			},
			{},
		);
	}

	const { cookie } = await createSession(env, user.id);

	// return_to の検証：allowlist 外なら /oauth/return を経由しない
	const requestedReturnTo = body.returnTo ?? null;
	let redirectTo = "/";
	if (requestedReturnTo && isAllowedReturnTo(env, requestedReturnTo)) {
		const next = new URLSearchParams({ next: requestedReturnTo });
		redirectTo = `/oauth/return?${next.toString()}`;
	}

	return jsonOk({ redirectTo }, { headers: { "Set-Cookie": cookie } });
}
