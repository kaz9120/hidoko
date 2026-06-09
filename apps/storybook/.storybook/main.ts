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
		"../../../packages/ui/src/**/*.stories.@(ts|tsx)",
		"../../snapcrop/app/**/*.stories.@(ts|tsx)",
		"../../futari-no-yotei/app/**/*.stories.@(ts|tsx)",
		"../../homepage/app/**/*.stories.@(ts|tsx)",
		"../stories/**/*.stories.@(ts|tsx)",
	],
};

export default config;
