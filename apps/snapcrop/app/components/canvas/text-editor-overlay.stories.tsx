import type { Meta, StoryObj } from "@storybook/react-vite";

import { DEFAULT_TEXT_DEFAULTS, type TextAnnotation } from "~/lib/text-engine";

import { TextEditorOverlay } from "./text-editor-overlay";

/**
 * インライン編集用の textarea オーバーレイ。空クリックからの新規作成
 * (editing.id === null) と、既存テキストのダブルクリック再編集 (id 付き) の
 * 両方を担う。アンカー位置に「確定後と同じ見た目」(フォント / サイズ / 色 /
 * 背景 / 寄せ) で重なり、blur か ⌘/Ctrl+Enter で確定、Esc で破棄、Enter は
 * 改行。空文字で確定すると注釈を作らない (既存は削除)。
 *
 * story では確定 / 破棄はログだけで何も起きない。textarea に直接入力して
 * 見た目 (フォントや背景の追従、複数行の伸び方) を確認する用途。
 *
 * @summary テキストのインライン編集 textarea
 */
const meta = {
	title: "snapcrop/Canvas/TextEditorOverlay",
	component: TextEditorOverlay,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story) => (
			<div className="relative h-[280px] w-[480px] overflow-hidden rounded-md border border-border bg-bg-raised">
				<Story />
			</div>
		),
	],
	args: {
		onCommit: () => null,
		onCancel: () => {},
		registerFlush: () => {},
	},
} satisfies Meta<typeof TextEditorOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

const mkText = (overrides: Partial<TextAnnotation>): TextAnnotation => ({
	id: "edit-1",
	kind: "text",
	x: 80,
	y: 100,
	text: "編集中のテキスト",
	fontFamily: "sans",
	fontSize: 28,
	align: "left",
	bold: false,
	italic: false,
	color: "#ef4444",
	background: "none",
	createdAt: 0,
	zIndex: 0,
	...overrides,
});

/**
 * 空クリック直後の新規作成状態。defaults の見た目 (sans 24px / 赤) の空
 * textarea が、クリック位置をアンカーに開く。点線アウトラインが
 * 「編集中でまだ commit されていない」ことを示す。
 * @summary 新規作成 (空の textarea)
 */
export const Creating: Story = {
	args: {
		editing: { id: null, x: 80, y: 100 },
		texts: [],
		defaults: DEFAULT_TEXT_DEFAULTS,
		zoom: 1,
	},
};

/**
 * 既存テキストの再編集 (ダブルクリック)。元の内容が全選択された状態で
 * 開き、すぐ打ち直せる。見た目はそのテキスト自身のプロパティに追従する。
 * @summary 既存テキストの再編集
 */
export const Reediting: Story = {
	args: {
		editing: { id: "edit-1", x: 80, y: 100 },
		texts: [mkText({})],
		defaults: DEFAULT_TEXT_DEFAULTS,
		zoom: 1,
	},
};

/**
 * 背景 (黒) 付き・複数行の再編集。背景色と角丸・余白も確定後と同じ計算で
 * 描かれるので、編集中と確定後の見た目のギャップが小さい。
 * @summary 背景付き複数行の再編集
 */
export const WithBackground: Story = {
	args: {
		editing: { id: "edit-1", x: 80, y: 80 },
		texts: [
			mkText({
				text: "背景付き\n2 行目",
				color: "#ffffff",
				background: "black",
				fontSize: 24,
			}),
		],
		defaults: DEFAULT_TEXT_DEFAULTS,
		zoom: 1,
	},
};

/**
 * `zoom = 2` で拡大表示中の編集。textarea の font-size は fontSize × zoom の
 * 画面 px で組まれ、確定後の SVG 表示と同じ大きさで編集できる。
 * @summary 拡大時の編集
 */
export const Zoomed: Story = {
	args: {
		editing: { id: "edit-1", x: 40, y: 40 },
		texts: [mkText({ x: 40, y: 40, fontSize: 18, text: "拡大編集" })],
		defaults: DEFAULT_TEXT_DEFAULTS,
		zoom: 2,
	},
};
