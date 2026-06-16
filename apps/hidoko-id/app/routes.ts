import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("signin", "routes/signin.tsx"),
	route("signup", "routes/signup.tsx"),
	route("verify-email", "routes/verify-email.tsx"),
	// パスワード再設定の 4 ステップ。route 単位の独立画面で flat に並べる。
	route("reset", "routes/reset.tsx"),
	route("reset/sent", "routes/reset.sent.tsx"),
	route("reset/new", "routes/reset.new.tsx"),
	route("reset/done", "routes/reset.done.tsx"),
	// アカウント設定はレイアウト + Outlet でネストする。
	route("account", "routes/account.tsx", [
		index("routes/account._index.tsx"),
		route("profile", "routes/account.profile.tsx"),
		route("credentials", "routes/account.credentials.tsx"),
		route("sessions", "routes/account.sessions.tsx"),
		route("danger", "routes/account.danger.tsx"),
	]),
	// 注：/verify?token=… は workers/app.ts が掴むので SPA route には載せない。
	// /oauth/return は次スライスで OAuth プロバイダに繋ぐためのプレースホルダ。
	route("oauth/return", "routes/oauth.return.tsx"),
] satisfies RouteConfig;
