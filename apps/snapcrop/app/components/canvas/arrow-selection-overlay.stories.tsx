import type { Meta, StoryObj } from "@storybook/react-vite";

import type { UseArrowEngineResult } from "~/hooks/use-arrow-engine";
import type { ArrowAnnotation } from "~/lib/arrow-engine";

import { ArrowSelectionOverlay } from "./arrow-selection-overlay";

/**
 * 選択中の矢印に重ねる ember ハロー (線に沿った半透明の太線) と、始点・終点の
 * 2 つの端点ハンドル。ハンドルだけが pointer-events を受けて端点ドラッグ
 * (リサイズ相当) を開始し、線上のクリックは下のレイヤー
 * (AnnotationInteractionLayer) へ流して move 開始に繋ぐ。Storybook では
 * ハンドルとハローを見せるための静的なスナップショットとして組む。
 *
 * @summary 選択矢印のハロー + 端点ハンドル
 */
const meta = {
	title: "snapcrop/Canvas/ArrowSelectionOverlay",
	component: ArrowSelectionOverlay,
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
} satisfies Meta<typeof ArrowSelectionOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

const STUB_ENGINE: UseArrowEngineResult = {
	renderedArrows: [],
	previewArrow: null,
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

const mkArrow = (overrides: Partial<ArrowAnnotation>): ArrowAnnotation => ({
	id: "sel-1",
	kind: "arrow",
	x1: 0,
	y1: 0,
	x2: 100,
	y2: 60,
	line: "straight",
	startCap: "none",
	endCap: "arrow",
	color: "#ef4444",
	thickness: "md",
	style: "clean",
	seed: 1,
	createdAt: 0,
	zIndex: 0,
	...overrides,
});

const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 280;

/**
 * 直線矢印を等倍 (zoom = 1) で選択中。両端の丸ハンドルが ember-400 で点き、
 * 線に沿った半透明ハローと組み合わさる。
 * @summary 等倍での選択状態
 */
export const Default: Story = {
	args: {
		arrow: mkArrow({ x1: 100, y1: 80, x2: 380, y2: 200 }),
		zoom: 1,
		engine: STUB_ENGINE,
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		getImagePoint: () => null,
	},
};

/**
 * 曲線矢印の選択状態。ハローも quadratic bezier に沿って引かれるので、
 * 「どこを掴めば動くか」が曲線でも読める。
 * @summary 曲線の選択状態
 */
export const Curved: Story = {
	args: {
		arrow: mkArrow({ x1: 80, y1: 220, x2: 400, y2: 80, line: "curve" }),
		zoom: 1,
		engine: STUB_ENGINE,
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		getImagePoint: () => null,
	},
};

/**
 * `zoom = 0.5` で縮小表示した場合。線の見た目は zoom で縮むが、ハンドル
 * (12px の固定サイズ) は CSS px なので大きさが変わらない — 縮小時に
 * ハンドルが相対的に大きく見えるのは rect と同じ仕様。
 * @summary 縮小時のハンドル相対サイズ
 */
export const Zoomed: Story = {
	args: {
		arrow: mkArrow({ x1: 120, y1: 120, x2: 760, y2: 400 }),
		zoom: 0.5,
		engine: STUB_ENGINE,
		imageWidth: IMAGE_WIDTH * 2,
		imageHeight: IMAGE_HEIGHT * 2,
		getImagePoint: () => null,
	},
};
