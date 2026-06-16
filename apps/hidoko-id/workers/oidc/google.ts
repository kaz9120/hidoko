// Google OIDC のサインイン／サインアップ（#202）。
// 認可コードフロー（confidential client）。
//
// /oauth/start/google → state + nonce を発行し Google の認可エンドポイントへ
// 302。state / nonce / return_to は oauth_state に 10 分保管。
// /oauth/callback/google → state を消費しトークン交換、id_token のクレームから
// (sub, email, email_verified) を取り出して、identities ↔ users を紐付け、
// セッションを発行して return_to へ戻す。
//
// id_token の RS256 署名は明示検証しない：Google の token エンドポイントへの
// POST は HTTPS（TLS）で行うため、Google のドメインを信頼することで送信元の
// 認証は担保される。OAuth 2.1 / OIDC Core でも、認可コードフロー（confidential
// client）の場合は signature 検証は任意（§3.1.3.5）。

import { isAllowedReturnTo } from "../return-to";
import { createSession } from "../session";
import { newId, now, randomToken } from "../tokens";
import type { Env } from "../types";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const STATE_TTL_MS = 10 * 60 * 1000;

// パスワードを持たない（Google だけで作られた）ユーザーの sentinel ハッシュ。
// verifyPassword はこの prefix を未知のアルゴリズムとして false を返すので、
// メール+パスワードでのサインインは失敗する。後から /account でパスワードを
// 設定するときに普通の scrypt ハッシュで上書きされる想定。
const EXTERNAL_ONLY_PASSWORD_HASH = "external$google";

interface IdTokenClaims {
	sub?: string;
	email?: string;
	email_verified?: boolean;
	nonce?: string;
	name?: string;
}

export async function handleGoogleStart(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.GOOGLE_CLIENT_ID) {
		return redirectToSignin(request, "oidc_not_configured");
	}

	const url = new URL(request.url);
	const returnTo = url.searchParams.get("return_to");

	const state = randomToken();
	const nonce = randomToken();
	const t = now();

	await env.DB.prepare(
		"INSERT INTO oauth_state (state, provider, nonce, return_to, created_at, expires_at) VALUES (?, 'google', ?, ?, ?, ?)",
	)
		.bind(state, nonce, returnTo, t, t + STATE_TTL_MS)
		.run();

	const baseUrl = env.PUBLIC_BASE_URL || new URL(request.url).origin;
	const redirectUri = `${baseUrl}/oauth/callback/google`;

	const params = new URLSearchParams({
		response_type: "code",
		client_id: env.GOOGLE_CLIENT_ID,
		redirect_uri: redirectUri,
		scope: "openid email profile",
		state,
		nonce,
		access_type: "online",
		prompt: "select_account",
	});

	return Response.redirect(`${GOOGLE_AUTH_URL}?${params}`, 302);
}

export async function handleGoogleCallback(
	request: Request,
	env: Env,
): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const errorParam = url.searchParams.get("error");

	if (errorParam) {
		return redirectToSignin(request, `oauth_${errorParam}`);
	}

	if (!code || !state) {
		return redirectToSignin(request, "missing_params");
	}

	if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
		return redirectToSignin(request, "oidc_not_configured");
	}

	// state を 1 回だけ確保（UPDATE ... RETURNING で TOCTOU 回避）。
	// 既に消費済み・期限切れ・存在しない state はここで弾く。
	const t = now();
	const claimed = await env.DB.prepare(
		"DELETE FROM oauth_state WHERE state = ? AND provider = 'google' AND expires_at >= ? RETURNING nonce, return_to",
	)
		.bind(state, t)
		.first<{ nonce: string; return_to: string | null }>();

	if (!claimed) {
		return redirectToSignin(request, "state_expired");
	}

	// 認可コードを id_token / access_token に交換。
	const baseUrl = env.PUBLIC_BASE_URL || new URL(request.url).origin;
	const redirectUri = `${baseUrl}/oauth/callback/google`;

	const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code,
			client_id: env.GOOGLE_CLIENT_ID,
			client_secret: env.GOOGLE_CLIENT_SECRET,
			redirect_uri: redirectUri,
			grant_type: "authorization_code",
		}),
	});

	if (!tokenRes.ok) {
		console.error(
			"[hidoko-id] google token exchange failed",
			tokenRes.status,
			await tokenRes.text().catch(() => "(read failed)"),
		);
		return redirectToSignin(request, "token_exchange_failed");
	}

	const tokenJson = (await tokenRes.json().catch(() => null)) as {
		id_token?: string;
	} | null;
	if (!tokenJson?.id_token) {
		return redirectToSignin(request, "missing_id_token");
	}

	const claims = parseJwtClaims(tokenJson.id_token);
	if (!claims?.sub || !claims.email) {
		return redirectToSignin(request, "invalid_id_token");
	}

	if (claims.nonce !== claimed.nonce) {
		return redirectToSignin(request, "nonce_mismatch");
	}

	const email = claims.email.toLowerCase();
	const emailVerified = claims.email_verified === true;
	const providerUserId = claims.sub;

	const userId = await findOrCreateUser(env, {
		email,
		emailVerified,
		providerUserId,
	});

	const { cookie } = await createSession(env, userId);

	let redirectTo = "/";
	if (claimed.return_to && isAllowedReturnTo(env, claimed.return_to)) {
		const next = new URLSearchParams({ next: claimed.return_to });
		redirectTo = `/oauth/return?${next.toString()}`;
	}

	return new Response(null, {
		status: 302,
		headers: { Location: redirectTo, "Set-Cookie": cookie },
	});
}

/**
 * Google sub と email から既存ユーザー／identity を引いて、なければ新規作成。
 * 順位:
 *   1. (provider, provider_user_id) で identities に既に紐付けがあればそのユーザー
 *   2. 同じメールの users があれば account linking して既存ユーザーを返す
 *   3. それ以外は新規 user + identities を作る（Google 経由なので Google が
 *      verified を返したら即 email_verified=1）
 */
async function findOrCreateUser(
	env: Env,
	args: { email: string; emailVerified: boolean; providerUserId: string },
): Promise<string> {
	const t = now();

	const linked = await env.DB.prepare(
		"SELECT user_id FROM identities WHERE provider = 'google' AND provider_user_id = ?",
	)
		.bind(args.providerUserId)
		.first<{ user_id: string }>();

	if (linked) return linked.user_id;

	const existing = await env.DB.prepare(
		"SELECT id, email_verified FROM users WHERE email = ?",
	)
		.bind(args.email)
		.first<{ id: string; email_verified: number }>();

	if (existing) {
		await env.DB.prepare(
			"INSERT INTO identities (id, user_id, provider, provider_user_id, created_at) VALUES (?, ?, 'google', ?, ?)",
		)
			.bind(newId(), existing.id, args.providerUserId, t)
			.run();

		// Google が verified=true を返しており、自分側がまだ未確認のときは引き上げる。
		if (args.emailVerified && existing.email_verified !== 1) {
			await env.DB.prepare(
				"UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?",
			)
				.bind(t, existing.id)
				.run();
		}

		return existing.id;
	}

	const userId = newId();
	await env.DB.batch([
		env.DB.prepare(
			"INSERT INTO users (id, email, email_verified, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		).bind(
			userId,
			args.email,
			args.emailVerified ? 1 : 0,
			EXTERNAL_ONLY_PASSWORD_HASH,
			t,
			t,
		),
		env.DB.prepare(
			"INSERT INTO identities (id, user_id, provider, provider_user_id, created_at) VALUES (?, ?, 'google', ?, ?)",
		).bind(newId(), userId, args.providerUserId, t),
	]);

	return userId;
}

/**
 * JWT の payload セグメントだけを base64url decode して JSON にする。
 * 署名検証は呼び出し側の責任（このフローでは TLS で代替している）。
 */
function parseJwtClaims(jwt: string): IdTokenClaims | null {
	try {
		const parts = jwt.split(".");
		if (parts.length !== 3) return null;
		const payload = parts[1] ?? "";
		const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
		const padded = b64 + "===".slice((b64.length + 3) % 4);
		const json = atob(padded);
		// atob は ASCII バイト列を返すので、UTF-8 文字（日本語名等）は decode が必要。
		const bytes = new Uint8Array(json.length);
		for (let i = 0; i < json.length; i++) bytes[i] = json.charCodeAt(i);
		const text = new TextDecoder().decode(bytes);
		return JSON.parse(text);
	} catch {
		return null;
	}
}

function redirectToSignin(request: Request, errorCode: string): Response {
	const url = new URL("/signin", request.url);
	url.searchParams.set("oauth_error", errorCode);
	return Response.redirect(url.href, 302);
}
