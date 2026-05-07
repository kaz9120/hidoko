import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Storybook 専用の Vite 設定。
// snapcrop 本体の vite.config.ts は React Router の Vite プラグインを含んでおり、
// Storybook の文脈では「Vite config file が必要」エラーを起こすため、
// Storybook では React Router を外して Tailwind / tsconfig paths だけを通す。
export default defineConfig({
	plugins: [tailwindcss(), tsconfigPaths()],
});
