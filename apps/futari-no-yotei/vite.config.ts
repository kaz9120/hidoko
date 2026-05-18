import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	server: {
		// `bun run dev` (vite) と `bun run dev:worker` (wrangler dev) を並走させる
		// 想定で、`/api` / `/webhook` だけ Worker に proxy する。フロントは vite が
		// HMR 付きで返す。
		proxy: {
			"/api": "http://localhost:8787",
			"/webhook": "http://localhost:8787",
		},
	},
});
