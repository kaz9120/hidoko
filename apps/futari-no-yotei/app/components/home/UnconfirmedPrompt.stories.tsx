import type { Meta, StoryObj } from "@storybook/react-vite";

import type { ApiStatusItem } from "~/lib/api/types";

import { UnconfirmedPrompt } from "./UnconfirmedPrompt";

/**
 * 未確定 → 確定への 1 タップ導線。1 つの項目について option ボタンを横並びに
 * し、推定値があればそれを selected として見せる。LINE で聞き合うより速い
 * 「いつも通り 1 タップ」の中核 UI。
 *
 * @summary 未確定項目の即決プロンプト
 */
const meta = {
	title: "futari-no-yotei/Home/UnconfirmedPrompt",
	component: UnconfirmedPrompt,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof UnconfirmedPrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

const DINNER_ITEM: ApiStatusItem = {
	id: "dinner",
	name: "晩御飯",
	emoji: "🍚",
	color: "var(--ember-500)",
	assignee: "both",
	sortOrder: 3,
	options: [
		{ id: "home", label: "ふたり家", emoji: "🍚" },
		{ id: "eatout", label: "ふたり外", emoji: "🍻" },
		{ id: "apart", label: "別行動", emoji: "↔︎" },
		{ id: "none", label: "不要", emoji: "✕" },
	],
	weekdayDefaults: {
		mon: "home",
		tue: "home",
		wed: "home",
		thu: "home",
		fri: "home",
		sat: "home",
		sun: "home",
	},
};

const BENTO_ITEM: ApiStatusItem = {
	id: "bento",
	name: "弁当",
	emoji: "🍱",
	color: "var(--moss)",
	assignee: "me",
	sortOrder: 2,
	options: [
		{ id: "yes", label: "必要", emoji: "🍱" },
		{ id: "no", label: "不要", emoji: "✕" },
	],
	weekdayDefaults: null,
};

/**
 * 晩御飯の典型。曜日デフォルトの「ふだん家」が selected として優しく出ている
 * 状態。1 タップで確定できる。
 * @summary 推定値あり
 */
export const Default: Story = {
	args: {
		item: DINNER_ITEM,
		dateKey: "2026-05-18",
		current: { optionId: "home", confirmed: false },
		onPick: () => undefined,
	},
};

/**
 * 推定値も無く、まっさらな状態から選び取る。weekdayDefaults を持たない項目を
 * 初めて使う日のリファレンス。
 * @summary 推定値なし
 */
export const NoEstimate: Story = {
	args: {
		item: BENTO_ITEM,
		dateKey: "2026-05-18",
		current: null,
		onPick: () => undefined,
	},
};

/**
 * 「ふたり外」を送信中。pendingOptionId が立つと全ボタンが disabled になり、
 * 該当ボタンに aria-busy が付く。連打や同時タップによる重複送信を防ぐ。
 * @summary 送信中の状態
 */
export const Submitting: Story = {
	args: {
		item: DINNER_ITEM,
		dateKey: "2026-05-18",
		current: { optionId: "home", confirmed: false },
		onPick: () => undefined,
		pendingOptionId: "eatout",
	},
};

/**
 * 晩御飯以外の項目では「{項目名}はどうする?」のフレーズになる。
 * 弁当のような家事系の質問の出方を確認する。
 * @summary 晩御飯以外の項目
 */
export const NonDinner: Story = {
	args: {
		item: BENTO_ITEM,
		dateKey: "2026-05-19",
		current: { optionId: "no", confirmed: false },
		onPick: () => undefined,
	},
};
