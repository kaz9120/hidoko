import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("week", "routes/week.tsx"),
	route("settings/status-items", "routes/settings.status-items.tsx"),
] satisfies RouteConfig;
