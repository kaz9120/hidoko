import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "ui/components/tooltip";

import { SiteHeader } from "./site-header";

/**
 * note-ogp 画面最上段のヘッダ。左にロゴ・アプリ名（「アイキャッチ台紙」）・
 * `NOTE OGP` バッジ、右にアプリのライト/ダークを切り替える ThemeToggle を
 * 並べる。`next-themes` を購読しているので Storybook では ThemeProvider と
 * ThemeToggle が依存する Tooltip の Provider で wrap する。
 *
 * @summary 画面上端のヘッダ
 */
const meta = {
	title: "note-ogp/Layout/SiteHeader",
	component: SiteHeader,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="dark">
				<TooltipProvider>
					<Story />
				</TooltipProvider>
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof SiteHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定状態。ロゴ・アプリ名・バッジが左、ThemeToggle が右に並ぶ。
 * @summary 既定状態
 */
export const Default: Story = {};
