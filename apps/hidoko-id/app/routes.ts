import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("signin", "routes/signin.tsx"),
	route("signup", "routes/signup.tsx"),
	route("verify-email", "routes/verify-email.tsx"),
	// 注：/verify?token=… は workers/app.ts が掴むので SPA route には載せない。
	// /oauth/return は次スライスで OAuth プロバイダに繋ぐためのプレースホルダ。
	route("oauth/return", "routes/oauth.return.tsx"),
] satisfies RouteConfig;
