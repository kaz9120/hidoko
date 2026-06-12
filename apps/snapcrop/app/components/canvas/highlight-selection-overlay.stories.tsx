import type { Meta, StoryObj } from "@storybook/react-vite";

import type { UseHighlightEngineResult } from "~/hooks/use-highlight-engine";
import type { HighlightAnnotation } from "~/lib/highlight-engine";

import { HighlightSelectionOverlay } from "./highlight-selection-overlay";

/**
 * 選択中のハイライトに重ねる ember ハロー (帯に沿った半透明の太線) と、
 * 始点・終点の 2 つの端点ハンドル。ハンドルだけが pointer-events を受けて
 * 端点ドラッグ (リサイズ相当) を開始し、帯上のクリックは下のレイヤー
 * (AnnotationInteractionLayer) へ流して move 開始に繋ぐ。Storybook では
 * ハンドルとハローを見せるための静的なスナップショットとして組む。
 *
 * @summary 選択ハイライトのハロー + 端点ハンドル
 */
const meta = {
	title: "snapcrop/Canvas/HighlightSelectionOverlay",
	component: HighlightSelectionOverlay,
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
} satisfies Meta<typeof HighlightSelectionOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

const STUB_ENGINE: UseHighlightEngineResult = {
	renderedHighlights: [],
	previewHighlight: null,
	isInteracting: false,
	beginDraw: () => {},
	beginMove: () => {},
	beginDuplicate: () => {},
	beginEndpointDrag: () => {},
	updateInteraction: () => {},
	endInteraction: () => {},
	cancelInteraction: () => {},
	handle: {
		isInteracting: () => false,
		cancelInteraction: () => {},
	},
};

const mkHighlight = (
	overrides: Partial<HighlightAnnotation>,
): HighlightAnnotation => ({
	id: "sel-1",
	kind: "highlight",
	x1: 0,
	y1: 0,
	x2: 100,
	y2: 60,
	color: "#fde047",
	opacity: 0.4,
	thickness: "md",
	createdAt: 0,
	...overrides,
});

const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 280;

/**
 * 水平ハイライトを等倍 (zoom = 1) で選択中。両端の丸ハンドルが ember-400 で
 * 点き、帯に沿った半透明ハローと組み合わさる。
 * @summary 等倍での選択状態
 */
export const Default: Story = {
	args: {
		highlight: mkHighlight({ x1: 80, y1: 120, x2: 400, y2: 120 }),
		zoom: 1,
		engine: STUB_ENGINE,
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		getImagePoint: () => null,
	},
};

/**
 * 太い帯 (`lg`) を斜めに引いた選択状態。ハローは帯幅 + 6px で追従するので、
 * 太いマーカーでも「選択されている」ことが読める。
 * @summary 太帯・斜めの選択状態
 */
export const ThickDiagonal: Story = {
	args: {
		highlight: mkHighlight({
			x1: 80,
			y1: 220,
			x2: 400,
			y2: 80,
			thickness: "lg",
			color: "#f9a8d4",
		}),
		zoom: 1,
		engine: STUB_ENGINE,
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		getImagePoint: () => null,
	},
};

/**
 * `zoom = 0.5` で縮小表示した場合。帯の見た目は zoom で縮むが、ハンドル
 * (12px の固定サイズ) は CSS px なので大きさが変わらない — 縮小時に
 * ハンドルが相対的に大きく見えるのは rect / arrow と同じ仕様。
 * @summary 縮小時のハンドル相対サイズ
 */
export const Zoomed: Story = {
	args: {
		highlight: mkHighlight({ x1: 120, y1: 120, x2: 760, y2: 400 }),
		zoom: 0.5,
		engine: STUB_ENGINE,
		imageWidth: IMAGE_WIDTH * 2,
		imageHeight: IMAGE_HEIGHT * 2,
		getImagePoint: () => null,
	},
};
