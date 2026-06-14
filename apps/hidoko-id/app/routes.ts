import { index, type RouteConfig } from "@react-router/dev/routes";

export default [
	// 認証画面は後続のコミットで足す。
	index("routes/home.tsx"),
] satisfies RouteConfig;
