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
		"../../snapcrop/app/**/*.stories.@(ts|tsx)",
		"../../homepage/app/**/*.stories.@(ts|tsx)",
		"../../note-ogp/app/**/*.stories.@(ts|tsx)",
	],
};

export default config;
