import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// 集約 Storybook 専用の Vite 設定。
// `tsconfigPaths` の root を monorepo ルートに向け、各 workspace の tsconfig
// (apps/snapcrop の `~/*` 等) を解決できるようにする。
export default defineConfig({
	plugins: [tailwindcss(), tsconfigPaths({ root: "../../.." })],
});
