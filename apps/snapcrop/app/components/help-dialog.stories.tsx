import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "ui/components/tooltip";

import { HelpDialog } from "./help-dialog";

/**
 * ヘッダ右クラスタのヘルプボタン。押すとキーボードショートカット一覧の
 * ダイアログが開く。`?` キーでも開ける (入力欄フォーカス中と IME 入力中は
 * 反応しない)。一覧の末尾には作者リンク (@kyamamoto9120 / kyamamoto.dev) が
 * 並ぶ。
 *
 * @summary ヘルプボタンとショートカット一覧ダイアログ
 */
const meta = {
	title: "snapcrop/HelpDialog",
	component: HelpDialog,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		),
	],
} satisfies Meta<typeof HelpDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 初期表示はヘルプアイコンのボタンだけ。クリックか `?` キーでショートカット
 * 一覧が開く。閲覧専用なので、外タップや Esc でそのまま閉じられる。
 * @summary ヘルプボタン (クリックで一覧が開く)
 */
export const Default: Story = {};
