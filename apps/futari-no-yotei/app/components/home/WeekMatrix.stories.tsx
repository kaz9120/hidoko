import type { Meta, StoryObj } from "@storybook/react-vite";

import type { ApiDayStatus, ApiStatusItem } from "~/lib/api/types";

import { WeekMatrix } from "./WeekMatrix";

/**
 * 「今日」を左端にした 7 日 × ステータス項目のマトリクス。確定値 / 推定値 /
 * 未回答の 3 状態を、絵文字の鮮明度とドットマーカーで読み分けさせる。
 * 色アクセントは「今日」列だけに集中させ、視線をそこに集める。
 *
 * @summary 週間ステータス俯瞰グリッド
 */
const meta = {
	title: "futari-no-yotei/Home/WeekMatrix",
	component: WeekMatrix,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof WeekMatrix>;

export default meta;

type Story = StoryObj<typeof meta>;

const ITEMS: ApiStatusItem[] = [
	{
		id: "work-h",
		name: "夫の勤務",
		emoji: "👔",
		color: "var(--ember-400)",
		assignee: "partner",
		sortOrder: 0,
		options: [
			{ id: "office", label: "出社", emoji: "🏢" },
			{ id: "remote", label: "リモート", emoji: "🏠" },
			{ id: "off", label: "休日", emoji: "🌙" },
		],
		weekdayDefaults: {
			mon: "office",
			tue: "remote",
			wed: "office",
			thu: "remote",
			fri: "remote",
			sat: "off",
			sun: "off",
		},
	},
	{
		id: "work-w",
		name: "妻の勤務",
		emoji: "💻",
		color: "var(--moon)",
		assignee: "me",
		sortOrder: 1,
		options: [
			{ id: "office", label: "出社", emoji: "🏢" },
			{ id: "remote", label: "リモート", emoji: "🏠" },
			{ id: "off", label: "休日", emoji: "🌙" },
		],
		weekdayDefaults: {
			mon: "remote",
			tue: "remote",
			wed: "office",
			thu: "remote",
			fri: "office",
			sat: "off",
			sun: "off",
		},
	},
	{
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
		weekdayDefaults: {
			mon: "yes",
			tue: "no",
			wed: "yes",
			thu: "no",
			fri: "no",
			sat: "no",
			sun: "no",
		},
	},
	{
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
	},
];

const DATES = [
	"2026-05-18",
	"2026-05-19",
	"2026-05-20",
	"2026-05-21",
	"2026-05-22",
	"2026-05-23",
	"2026-05-24",
];

const TODAY_KEY = "2026-05-18";

const mkStatus = (
	date: string,
	statusItemId: string,
	optionId: string,
): ApiDayStatus => ({
	date,
	statusItemId,
	optionId,
	confirmed: true,
	updatedBy: "u_me",
	updatedAt: "2026-05-18T08:00:00Z",
});

/**
 * 典型的な平日: 今日は全項目確定、明日以降は推定 (淡色) と未回答が混在する。
 * 「LINE で聞き合うより速い」中核 UI のリファレンス状態。
 * @summary 典型的な週の表示
 */
export const Default: Story = {
	args: {
		items: ITEMS,
		statuses: [
			mkStatus("2026-05-18", "work-h", "office"),
			mkStatus("2026-05-18", "work-w", "office"),
			mkStatus("2026-05-18", "bento", "yes"),
			mkStatus("2026-05-19", "work-w", "office"),
			mkStatus("2026-05-20", "work-h", "office"),
			mkStatus("2026-05-20", "bento", "no"),
			mkStatus("2026-05-20", "dinner", "none"),
			mkStatus("2026-05-22", "dinner", "eatout"),
		],
		dates: DATES,
		todayKey: TODAY_KEY,
	},
};

/**
 * 確定値がまだ何もない状態。全セルが推定 (weekdayDefaults 由来) または
 * 未回答ドットで埋まる。リリース直後 / データクリア直後の見え方確認用。
 * @summary 確定値なし
 */
export const NoConfirmed: Story = {
	args: {
		items: ITEMS,
		statuses: [],
		dates: DATES,
		todayKey: TODAY_KEY,
	},
};

/**
 * weekdayDefaults を持たない項目だけが並んだとき、未回答セルがどう見えるかを
 * 確認する。中央のドットが基準より目立ち過ぎないか・暗背景に沈み過ぎないかの
 * チェックに使う。
 * @summary 推定値もない場合
 */
export const NoDefaults: Story = {
	args: {
		items: ITEMS.map((item) => ({ ...item, weekdayDefaults: null })),
		statuses: [
			mkStatus("2026-05-18", "work-h", "office"),
			mkStatus("2026-05-22", "dinner", "eatout"),
		],
		dates: DATES,
		todayKey: TODAY_KEY,
	},
};

/**
 * 項目が 1 つだけ。スパース時にレイアウトが破綻しないかを確認する。
 * @summary 単一項目
 */
export const SingleItem: Story = {
	args: {
		items: [ITEMS[3]],
		statuses: [
			mkStatus("2026-05-18", "dinner", "home"),
			mkStatus("2026-05-22", "dinner", "eatout"),
		],
		dates: DATES,
		todayKey: TODAY_KEY,
	},
};
