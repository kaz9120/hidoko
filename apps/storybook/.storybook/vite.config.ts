import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// 集約 Storybook 専用の Vite 設定。
// `tsconfigPaths` の root を monorepo ルートに向け、各 workspace の tsconfig
// (apps/snapcrop の `~/*` 等) を解決できるようにする。
export default defineConfig({
	plugins: [tailwindcss(), tsconfigPaths({ root: "../../.." })],
	// takibi-design-system は TSX のソースのまま配布される。node_modules の TSX は
	// React プラグインが変換しないので、esbuild にも新しい JSX 変換を使わせる
	// （既定の React.createElement だと「React is not defined」で落ちる）。
	// esbuild はビルド時の変換、optimizeDeps は dev の事前バンドルに効く。
	esbuild: { jsx: "automatic" },
	optimizeDeps: { esbuildOptions: { jsx: "automatic" } },
});
