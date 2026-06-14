import { sendVerificationEmail } from "../email";
import { hashPassword } from "../password";
import { newId, now, randomToken, sha256Hex } from "../tokens";
import type { Env } from "../types";
import { jsonError, jsonOk, readJson } from "./helpers";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

interface SignupBody {
	email?: string;
	password?: string;
	termsAccepted?: boolean;
}

export async function handleSignup(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "POST") {
		return jsonError(405, "method not allowed");
	}

	const body = await readJson<SignupBody>(request);
	if (!body) return jsonError(400, "リクエストボディが不正", "bad_json");

	const email = (body.email ?? "").trim().toLowerCase();
	const password = body.password ?? "";
	if (!isEmailLike(email)) {
		return jsonError(400, "メールアドレスの形式が正しくない", "invalid_email");
	}
	if (!validatePassword(password)) {
		return jsonError(
			400,
			"パスワードは英数字を含む 12 文字以上が必要",
			"invalid_password",
		);
	}
	if (!body.termsAccepted) {
		return jsonError(400, "利用規約への同意が必要", "terms_required");
	}

	const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
		.bind(email)
		.first<{ id: string }>();
	if (existing) {
		return jsonError(409, "このメールは既に使われている", "email_taken");
	}

	const userId = newId();
	const passwordHash = await hashPassword(password);
	const t = now();
	await env.DB.prepare(
		"INSERT INTO users (id, email, email_verified, password_hash, created_at, updated_at) VALUES (?, ?, 0, ?, ?, ?)",
	)
		.bind(userId, email, passwordHash, t, t)
		.run();

	const verifyToken = randomToken();
	const tokenHash = await sha256Hex(verifyToken);
	await env.DB.prepare(
		"INSERT INTO email_verification_tokens (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
	)
		.bind(tokenHash, userId, t, t + VERIFY_TTL_MS)
		.run();

	const baseUrl = env.PUBLIC_BASE_URL || new URL(request.url).origin;
	const verifyUrl = `${baseUrl}/verify?token=${encodeURIComponent(verifyToken)}`;

	const sendResult = await sendVerificationEmail(env, {
		to: email,
		verifyUrl,
	});

	return jsonOk({
		email,
		// dev で sender 未設定なら確認 URL を返してそのまま踏めるようにする
		...(sendResult.devUrl ? { devVerifyUrl: sendResult.devUrl } : {}),
	});
}

function isEmailLike(email: string): boolean {
	// 厳密ではないが、`a@b.c` 程度の形は通す。最終的には MX 確認は別で。
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
	if (password.length < 12) return false;
	if (!/[A-Za-z]/.test(password)) return false;
	if (!/\d/.test(password)) return false;
	return true;
}
