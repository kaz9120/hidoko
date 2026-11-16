import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	// takibi-design-system は TSX のソースのまま配布される。React プラグインは
	// node_modules の TSX を変換せず、esbuild の既定（React.createElement）だと
	// 「React is not defined」で落ちるので、新しい JSX 変換を使わせる。
	// esbuild はビルド時の変換、optimizeDeps は dev の事前バンドルに効く。
	esbuild: { jsx: "automatic" },
	optimizeDeps: { esbuildOptions: { jsx: "automatic" } },
	server: {
		// Vite は SPA を 5173 で出し、`/api/*` と `/verify` は wrangler dev（8787）に転送する。
		// 本番は workers/app.ts が直接ハンドルするので、この proxy は dev 専用。
		proxy: {
			"/api": "http://localhost:8787",
			"/verify": "http://localhost:8787",
		},
	},
});
