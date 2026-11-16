import type { Preview } from "@storybook/react-vite";
import { useEffect } from "react";
import { setTheme, Toaster, TooltipProvider } from "takibi-design-system";

import "../app/globals.css";

const preview: Preview = {
	globalTypes: {
		theme: {
			description: "テーマ",
			toolbar: {
				title: "テーマ",
				icon: "mirror",
				items: [
					{ value: "dark", title: "夜（ダーク）", icon: "moon" },
					{ value: "light", title: "昼（ライト）", icon: "sun" },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: { theme: "dark" },
	decorators: [
		(Story, context) => {
			const theme = context.globals.theme ?? "dark";
			useEffect(() => {
				setTheme(theme);
			}, [theme]);
			return (
				<TooltipProvider>
					<Story />
					<Toaster />
				</TooltipProvider>
			);
		},
	],
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
