import type { Meta, StoryObj } from "@storybook/react-vite";

import { EmptyState } from "./empty-state";

/**
 * 一覧系のセクションでデータが 0 件のときに見せる薄いプレースホルダ。
 * 破線ボーダーの内側にメッセージだけを置く。Decks / NotePicks / MediaList
 * から内部的に呼ばれる。
 *
 * @summary データ 0 件時のプレースホルダ
 */
const meta = {
	title: "homepage/EmptyState",
	component: EmptyState,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定のメッセージ「準備中」。message を渡さなかったときの fallback を確認する。
 * @summary 既定メッセージ
 */
export const Default: Story = {};

/**
 * 任意の文言を差し込んだ例。セクションの文脈に合わせて言い換える。
 * @summary 文言を差し替えた例
 */
export const CustomMessage: Story = {
	args: {
		message: "まだ薪をくべていません",
	},
};
