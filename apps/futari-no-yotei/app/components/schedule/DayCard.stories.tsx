import type { Meta, StoryObj } from "@storybook/react-vite";

import { DayCard } from "./DayCard";

/**
 * 統一日カード。左ガターに曜日 + 日付、右にステータス絵文字行 + 予定行。
 * 週ビュー (縦に 7 枚) / ホームの「今日・明日」/ 日詳細の入口など複数の
 * 場面から呼ばれる。
 *
 * 表示状態は today / normal / past の 3 種、サイズは compact / normal / large
 * の 3 段階。データはサンプル fixture (sample.ts の SCHEDULES / DAY_STATUSES)
 * から `dateKey` で引いてくる。
 *
 * @summary 1 日分のカード
 */
const meta = {
	title: "futari-no-yotei/Schedule/DayCard",
	component: DayCard,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof DayCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 通常の日 (火 5/19)。ステータスは妻だけ確定、他は推定。予定なし。
 * @summary 通常の日
 */
export const Default: Story = {
	args: {
		dateKey: "2026-05-19",
	},
};

/**
 * 「今日」の表示 (月 5/18)。accent カラーのグラデ背景と ember 系の発光で
 * 視線が集中する。ランチ MTG と同僚と飲みの予定が入っている。
 * @summary 今日の強調表示
 */
export const Today: Story = {
	args: {
		dateKey: "2026-05-18",
		label: "今日",
		variant: "today",
	},
};

/**
 * 過去の日 (金 5/15)。opacity 0.5 で沈み、振り返り視点であることを示す。
 * @summary 過去の日
 */
export const Past: Story = {
	args: {
		dateKey: "2026-05-15",
		variant: "past",
	},
};

/**
 * 記念日 (金 5/22)。anniversary フラグが立った予定のタイトルが太字で出る。
 * 結婚記念日と寿司の予約が並ぶ。
 * @summary 記念日入りの日
 */
export const Anniversary: Story = {
	args: {
		dateKey: "2026-05-22",
		label: "記念日",
	},
};

/**
 * compact サイズ。週ビューで 7 枚縦に並べる時のリファレンス。
 * @summary 小さいサイズ
 */
export const Compact: Story = {
	args: {
		dateKey: "2026-05-20",
		size: "compact",
	},
};

/**
 * large サイズ。日詳細画面の見出しカードとして使う想定。
 * @summary 大きいサイズ
 */
export const Large: Story = {
	args: {
		dateKey: "2026-05-22",
		size: "large",
		label: "記念日",
	},
};

/**
 * `hideEmptyStatus` でステータス絵文字行を隠す形。「予定だけ見せたい」週末
 * カレンダー用途で使う。
 * @summary 予定だけ表示
 */
export const ScheduleOnly: Story = {
	args: {
		dateKey: "2026-05-15",
		hideEmptyStatus: true,
	},
};
