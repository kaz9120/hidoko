import type { Meta, StoryObj } from "@storybook/react-vite";

import type { TextAnnotation } from "~/lib/text-engine";

import { TextLayer } from "./text-layer";
import { TextSelectionOverlay } from "./text-selection-overlay";

/**
 * 選択中のテキストに重ねる ember ring。rect の selection ring と同じ見た目
 * だが、テキストはリサイズハンドルを持たない (サイズはツールバーのフォント
 * サイズで変える) ので全体が pointer-events:none。ring の位置は text-engine
 * の外接矩形 (背景があれば背景込み) から計算する。
 *
 * story では ring 単体だと位置が読めないので、下に TextLayer を重ねて
 * 「テキストを選択した見た目」を再現している。
 *
 * @summary 選択テキストの ember ring
 */
const meta = {
	title: "snapcrop/Canvas/TextSelectionOverlay",
	component: TextSelectionOverlay,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof TextSelectionOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 280;

const mkText = (overrides: Partial<TextAnnotation>): TextAnnotation => ({
	id: "sel-1",
	kind: "text",
	x: 80,
	y: 100,
	text: "選択中のテキスト",
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

const withLayer = (text: TextAnnotation, zoom: number) => (
	<div
		className="relative overflow-hidden rounded-md border border-border bg-bg-raised"
		style={{ width: IMAGE_WIDTH * zoom, height: IMAGE_HEIGHT * zoom }}
	>
		<TextLayer
			imageHeight={IMAGE_HEIGHT}
			imageWidth={IMAGE_WIDTH}
			texts={[text]}
		/>
		<TextSelectionOverlay text={text} zoom={zoom} />
	</div>
);

/**
 * 背景なしテキストを等倍 (zoom = 1) で選択中。外接矩形の 3px 外側に
 * ember-400 の 1px ring が点く。
 * @summary 等倍での選択状態
 */
export const Default: Story = {
	args: {
		text: mkText({}),
		zoom: 1,
	},
	render: (args) => withLayer(args.text, args.zoom),
};

/**
 * 背景 (黒) 付き・複数行の選択状態。ring は背景矩形込みの外接矩形を囲む
 * ので、「掴める範囲」がそのまま読める。
 * @summary 背景付き複数行の選択状態
 */
export const WithBackground: Story = {
	args: {
		text: mkText({
			text: "背景付き\n2 行目はすこし長い",
			color: "#ffffff",
			background: "black",
			fontSize: 22,
		}),
		zoom: 1,
	},
	render: (args) => withLayer(args.text, args.zoom),
};

/**
 * `zoom = 0.5` で縮小表示した場合。ring の余白 (3px) は画面 px 固定なので、
 * 縮小しても ring と文字の間隔は変わらない — rect / arrow のハンドルと
 * 同じ仕様。
 * @summary 縮小時の ring
 */
export const Zoomed: Story = {
	args: {
		text: mkText({ fontSize: 48, text: "縮小表示" }),
		zoom: 0.5,
	},
	render: (args) => withLayer(args.text, args.zoom),
};
