import type { Meta, StoryObj } from "@storybook/react-vite";

import type { UseRectEngineResult } from "~/hooks/use-rect-engine";
import type { RectAnnotation } from "~/lib/rect-engine";

import { RectSelectionOverlay } from "./rect-selection-overlay";

/**
 * 選択中の矩形に重ねる 1px ember ring と 8 つのリサイズハンドル。本体 (ring の
 * 内側) は pointer-events を受け取らず、下のレイヤー (AnnotationInteractionLayer) に
 * クリックを流して move 開始に繋ぐ。Storybook ではハンドルを見せるための
 * 静的なスナップショットとして組む。
 *
 * @summary 選択矩形の ring + リサイズハンドル
 */
const meta = {
	title: "snapcrop/Canvas/RectSelectionOverlay",
	component: RectSelectionOverlay,
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
} satisfies Meta<typeof RectSelectionOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

const STUB_ENGINE: UseRectEngineResult = {
	renderedAnnotations: [],
	previewRect: null,
	isInteracting: false,
	beginDraw: () => {},
	beginMove: () => {},
	beginDuplicate: () => {},
	beginResize: () => {},
	updateInteraction: () => {},
	endInteraction: () => {},
	cancelInteraction: () => {},
	handle: {
		isInteracting: () => false,
		cancelInteraction: () => {},
	},
};

const mkRect = (overrides: Partial<RectAnnotation>): RectAnnotation => ({
	id: "sel-1",
	kind: "rect",
	x: 0,
	y: 0,
	width: 100,
	height: 60,
	style: "outline",
	color: "#ef4444",
	thickness: "md",
	createdAt: 0,
	zIndex: 0,
	...overrides,
});

/**
 * 中型の矩形を等倍 (zoom = 1) で選択中。8 つのハンドルが ember-400 で点いて、
 * 1px 枠線と組み合わさる。
 * @summary 等倍での選択状態
 */
export const Default: Story = {
	args: {
		annotation: mkRect({ x: 120, y: 60, width: 220, height: 140 }),
		zoom: 1,
		engine: STUB_ENGINE,
		getImagePoint: () => null,
	},
};

/**
 * `zoom = 0.5` で縮小表示した場合。本体の見た目は zoom で縮むが、ハンドル
 * (12px の固定サイズ) は CSS px なので大きさが変わらない — 縮小時に
 * ハンドルが相対的に大きく見えるのは仕様。
 * @summary 縮小時のハンドル相対サイズ
 */
export const Zoomed: Story = {
	args: {
		annotation: mkRect({ x: 80, y: 40, width: 320, height: 180 }),
		zoom: 0.5,
		engine: STUB_ENGINE,
		getImagePoint: () => null,
	},
};

/**
 * 矩形が最小サイズ (4px) 付近のときにハンドルがどう並ぶかの確認。実 UI
 * では作成側で MIN_RECT_SIZE を切ると drawing 自体が破棄されるが、選択中
 * リサイズで小さくなった場合の見え方を見ておく。
 * @summary 最小サイズ近傍
 */
export const Tiny: Story = {
	args: {
		annotation: mkRect({ x: 200, y: 120, width: 24, height: 24 }),
		zoom: 1,
		engine: STUB_ENGINE,
		getImagePoint: () => null,
	},
};
