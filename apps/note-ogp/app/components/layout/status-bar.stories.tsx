import type { Meta, StoryObj } from "@storybook/react-vite";

import { DEFAULTS } from "~/lib/storage";

import { StatusBar } from "./status-bar";

/**
 * note-ogp 画面下端のステータスバー。snapcrop の `status-bar.tsx` と同じ
 * 「下端 24px / `bg-card/50` の地」を踏襲し、note-ogp 固有の情報（出力寸法
 * 1280×670 固定・表示倍率・タイトル位置と号数の身振り・タイトルの文字数 /
 * 可読性 / 自動保存時刻）に組み替えている。Stage 上に常設していた寸法ラベルと
 * % キャプションを撤去し、この 1 箇所に集約する。
 *
 * @summary 画面下端のステータスバー
 */
const meta = {
	title: "note-ogp/Layout/StatusBar",
	component: StatusBar,
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof StatusBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 初期値のフィールドで、まだ保存も発火していない初回マウント直後の状態。
 * 可読性インジケータは未確定（タイトルは入っているが titleFontSize がまだ
 * 計測されていない）ので、サイズ閾値はまだ効かず、OK のドットだけが点く。
 *
 * @summary 初回マウント直後
 */
export const Default: Story = {
	args: {
		fields: DEFAULTS,
		scale: 0.5,
		titleFontSize: null,
		lastSavedAt: null,
	},
};

/**
 * 編集が反映され、自動保存も走った状態。タイトルのフォントサイズは十分大きく、
 * 「タイムラインで読める」 moss ドットが点く。
 *
 * @summary 保存済み・可読性 OK
 */
export const Saved: Story = {
	args: {
		fields: DEFAULTS,
		scale: 0.42,
		titleFontSize: 88,
		lastSavedAt: new Date(2026, 5, 13, 12, 34),
	},
};

/**
 * タイトルが長すぎて AutoFitTitle が大幅に縮め、タイムラインで読みにくくなった
 * 状態。警告色のインジケータが「タイムラインで小さい」を出す。
 *
 * @summary 可読性警告（タイトル長すぎ）
 */
export const ReadabilityWarn: Story = {
	args: {
		fields: {
			...DEFAULTS,
			title:
				"これはとても長いタイトルでタイムラインのカード幅に入ると読めなくなる例",
		},
		scale: 0.42,
		titleFontSize: 28,
		lastSavedAt: new Date(2026, 5, 13, 12, 34),
	},
};
