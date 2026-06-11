import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "ui/components/tooltip";

import { ThemeToggle } from "./theme-toggle";

/**
 * コントロールパネルのヘッダー右上に座る、アプリ UI のテーマ切替ボタン。
 * `next-themes` の `useTheme` を読み、現在ダークなら太陽、ライトなら月の
 * アイコンを出して、押すと反対側に切り替わる。書き出す OGP 画像のテーマ
 * (コントロールパネルの「テーマ」) とは独立して動くので、ラベルは
 * 「アプリを〜」で始めて区別している。
 *
 * @summary アプリのテーマ切替ボタン
 */
const meta = {
	title: "note-ogp/ThemeToggle",
	component: ThemeToggle,
	parameters: {
		layout: "centered",
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
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 初期表示。Storybook 自体がダークで立ち上がるので、ボタンには太陽アイコンが
 * 出る (押すとライトに切り替わる)。
 * @summary 既定の表示
 */
export const Default: Story = {};
