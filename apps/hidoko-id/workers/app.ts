// hidoko-id の Worker エントリ。
// /api/* と /verify は Worker で完結させ、それ以外は ASSETS（SPA）にフォールスルー。
// 次スライスで /oauth/{authorize,token,register} を @cloudflare/workers-oauth-provider に
// 渡すため、ここで OAuth ハンドラを差し込むポイントを残してある。

import { handleGoogleCallback, handleGoogleStart } from "./oidc/google";
import {
	handleChangePassword,
	handleDeleteAccount,
	handleListSessions,
	handleMe,
	handleRequestEmailChange,
	handleRevokeOtherSessions,
	handleRevokeSession,
	handleUpdateProfile,
} from "./routes/account";
import { handleResetConfirm, handleResetRequest } from "./routes/reset";
import { handleSignin } from "./routes/signin";
import { handleSignout } from "./routes/signout";
import { handleSignup } from "./routes/signup";
import { handleVerify } from "./routes/verify";
import { handleVerifyEmailChange } from "./routes/verify-email-change";
import type { Env } from "./types";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		try {
			// ここから 6 経路（#215 影響範囲）はメソッド判定を handler 側に寄せ、path 一致だけで
			// dispatch する。誤メソッドは handler が 405 を返す（path はあるが method が違う
			// リクエストが SPA フォールスルーで HTML を返してしまうのを避ける）。残りの経路は
			// path+method 判定のままで、別途 follow-up。
			if (path === "/api/signup") {
				return await handleSignup(request, env);
			}
			if (path === "/api/signin") {
				return await handleSignin(request, env);
			}
			if (path === "/api/signout") {
				return await handleSignout(request, env);
			}
			if (path === "/api/reset/request") {
				return await handleResetRequest(request, env);
			}
			if (path === "/api/reset/confirm") {
				return await handleResetConfirm(request, env);
			}
			if (path === "/verify") {
				return await handleVerify(request, env);
			}
			if (path === "/oauth/start/google" && request.method === "GET") {
				return await handleGoogleStart(request, env);
			}
			if (path === "/oauth/callback/google" && request.method === "GET") {
				return await handleGoogleCallback(request, env);
			}
			if (path === "/api/me" && request.method === "GET") {
				return await handleMe(request, env);
			}
			if (path === "/api/sessions" && request.method === "GET") {
				return await handleListSessions(request, env);
			}
			if (path === "/api/sessions/revoke-others" && request.method === "POST") {
				return await handleRevokeOtherSessions(request, env);
			}
			// /api/sessions/:id/revoke
			const revokeMatch = path.match(/^\/api\/sessions\/([^/]+)\/revoke$/);
			if (revokeMatch && request.method === "POST") {
				return await handleRevokeSession(request, env, revokeMatch[1]);
			}
			if (path === "/api/account" && request.method === "PATCH") {
				return await handleUpdateProfile(request, env);
			}
			if (path === "/api/account/password" && request.method === "POST") {
				return await handleChangePassword(request, env);
			}
			if (path === "/api/account/email" && request.method === "POST") {
				return await handleRequestEmailChange(request, env);
			}
			if (path === "/api/account" && request.method === "DELETE") {
				return await handleDeleteAccount(request, env);
			}
			if (path === "/verify-email-change" && request.method === "GET") {
				return await handleVerifyEmailChange(request, env);
			}

			// 次スライスの予約地：/oauth/{authorize,token,register} と /.well-known/* を
			// @cloudflare/workers-oauth-provider が掴むようにここで分岐する。

			return env.ASSETS.fetch(request);
		} catch (err) {
			console.error("[hidoko-id] unhandled error", err);
			return new Response(
				JSON.stringify({ ok: false, error: "internal error" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json; charset=utf-8" },
				},
			);
		}
	},
} satisfies ExportedHandler<Env>;
