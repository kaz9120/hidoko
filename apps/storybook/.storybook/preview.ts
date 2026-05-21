import type { Preview } from "@storybook/react-vite";

import "../app/globals.css";

// tokens.css は :root をダーク、`.light` をライトとして扱う。
// snapcrop の慣習を踏襲し、Storybook も初期は dark で起動する。
// light/dark の toolbar 切替は別 PR で globalTypes + decorator として追加予定。
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
