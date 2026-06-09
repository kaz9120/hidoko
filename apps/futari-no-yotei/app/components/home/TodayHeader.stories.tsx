import type { Meta, StoryObj } from "@storybook/react-vite";

import { TodayHeader } from "./TodayHeader";

/**
 * ホーム最上部に置く今日の見出し。accent カラーの大きな日付数字で「いま、ここ」
 * を示し、未確定件数のバッジを右肩に添える。視線の出発点として、画面の最初に
 * 必ず出る位置に置く。
 *
 * @summary ホーム最上部の今日見出し
 */
const meta = {
	title: "futari-no-yotei/Home/TodayHeader",
	component: TodayHeader,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof TodayHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 未確定が残っている典型状態。バッジが accent 系の点線枠で出て、ユーザーに
 * 「まだ決めることがある」ことを優しく知らせる。
 * @summary 未確定あり
 */
export const Default: Story = {
	args: {
		dateKey: "2026-05-18",
		summary: "晩御飯がまだ決まっていない",
		unconfirmedCount: 1,
	},
};

/**
 * すべて確定済み。バッジは出さず、サマリーも穏やかな締めの一文に。
 * 「今日は決め終わった」という安心の状態。
 * @summary 全部確定済み
 */
export const AllConfirmed: Story = {
	args: {
		dateKey: "2026-05-18",
		summary: "今日のぶんは決まっている",
		unconfirmedCount: 0,
	},
};

/**
 * 未確定が複数件残っているケース。バッジ内の数字が 2 桁になっても枠が
 * 破綻しないか、サマリーの折返しと干渉しないかを確認する。
 * @summary 未確定が複数件
 */
export const ManyUnconfirmed: Story = {
	args: {
		dateKey: "2026-05-22",
		summary: "結婚記念日。晩御飯と勤務の確定が残っている",
		unconfirmedCount: 12,
	},
};

/**
 * サマリー省略時。スペースを詰めて日付と曜日だけが残るレイアウトを確認する。
 * @summary サマリーなし
 */
export const NoSummary: Story = {
	args: {
		dateKey: "2026-05-18",
		unconfirmedCount: 0,
	},
};
