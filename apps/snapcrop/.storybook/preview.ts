import type { Preview } from "@storybook/react-vite";

import "../app/globals.css";

// design-system は :root をダーク、`.light` をライトとして扱う。
// snapcrop 本体は <html class="dark"> 起動なので、Storybook でも同じ前提で表示する。
if (typeof document !== "undefined") {
	document.documentElement.classList.add("dark");
}

const preview: Preview = {
	parameters: {
		layout: "centered",
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;
