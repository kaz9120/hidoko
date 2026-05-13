import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	framework: {
		name: "@storybook/react-vite",
		options: {
			builder: {
				viteConfigPath: ".storybook/vite.config.ts",
			},
		},
	},
	stories: [
		"../app/**/*.stories.@(ts|tsx)",
		"../../../packages/ui/src/**/*.stories.@(ts|tsx)",
	],
};

export default config;
