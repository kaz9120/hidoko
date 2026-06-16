// hidoko-id の Worker エントリ。
// /api/* と /verify は Worker で完結させ、それ以外は ASSETS（SPA）にフォールスルー。
// 次スライスで /oauth/{authorize,token,register} を @cloudflare/workers-oauth-provider に
// 渡すため、ここで OAuth ハンドラを差し込むポイントを残してある。

import { handleGoogleCallback, handleGoogleStart } from "./oidc/google";
import { handleResetConfirm, handleResetRequest } from "./routes/reset";
import { handleSignin } from "./routes/signin";
import { handleSignout } from "./routes/signout";
import { handleSignup } from "./routes/signup";
import { handleVerify } from "./routes/verify";
import type { Env } from "./types";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		try {
			if (path === "/api/signup" && request.method === "POST") {
				return await handleSignup(request, env);
			}
			if (path === "/api/signin" && request.method === "POST") {
				return await handleSignin(request, env);
			}
			if (path === "/api/signout" && request.method === "POST") {
				return await handleSignout(request, env);
			}
			if (path === "/api/reset/request" && request.method === "POST") {
				return await handleResetRequest(request, env);
			}
			if (path === "/api/reset/confirm" && request.method === "POST") {
				return await handleResetConfirm(request, env);
			}
			if (path === "/verify" && request.method === "GET") {
				return await handleVerify(request, env);
			}
			if (path === "/oauth/start/google" && request.method === "GET") {
				return await handleGoogleStart(request, env);
			}
			if (path === "/oauth/callback/google" && request.method === "GET") {
				return await handleGoogleCallback(request, env);
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
