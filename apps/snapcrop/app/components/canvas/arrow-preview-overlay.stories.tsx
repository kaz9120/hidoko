import type { Meta, StoryObj } from "@storybook/react-vite";

import { PRESET_COLORS } from "~/lib/rect-engine";

import { ArrowPreviewOverlay } from "./arrow-preview-overlay";

/**
 * 矢印ツールでドラッグ中、まだ commit されていない矢印を破線でプレビュー
 * 表示する SVG レイヤー。線形・キャップ・色・太さは現在の arrowDefaults を
 * 反映するので、確定後の見た目をそのまま先取りできる。pointer event は
 * 通さず、見せるだけ。実 UI では `useArrowEngine` の `previewArrow` が
 * 走る間だけ mount される。
 *
 * @summary 描画中の矢印プレビュー (破線)
 */
const meta = {
	title: "snapcrop/Canvas/ArrowPreviewOverlay",
	component: ArrowPreviewOverlay,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story) => (
			<div className="relative h-[300px] w-[480px] overflow-hidden rounded-md border border-border bg-bg-raised">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArrowPreviewOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 300;

/**
 * 典型的なドラッグ中の状態。デフォルト設定 (直線 + 終点矢頭) の破線で
 * 「未確定」を示す。`endInteraction` で commit されると ArrowLayer 側の
 * 実線に切り替わる。
 * @summary 描画中のプレビュー
 */
export const Default: Story = {
	args: {
		previewArrow: { x1: 80, y1: 220, x2: 380, y2: 80, seed: 1 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		defaults: {
			line: "straight",
			startCap: "none",
			endCap: "arrow",
			color: PRESET_COLORS[0],
			thickness: "md",
			style: "clean",
		},
	},
};

/**
 * 手書き風 (sketchy) でのプレビュー。破線のまま揺らぎ線になり、commit 後の
 * 形 (同じ seed) をそのまま先取りする。
 * @summary 手書き風のプレビュー
 */
export const Sketchy: Story = {
	args: {
		previewArrow: { x1: 80, y1: 200, x2: 400, y2: 100, seed: 7 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		defaults: {
			line: "straight",
			startCap: "none",
			endCap: "arrow",
			color: PRESET_COLORS[0],
			thickness: "md",
			style: "sketchy",
		},
	},
};

/**
 * 曲線 + 両端キャップ + 太線 (`lg`) でのプレビュー。dasharray は
 * stroke-width に比例して伸びるので、太くしても破線パターンが読める。
 * @summary 曲線・太線でのプレビュー
 */
export const CurvedThick: Story = {
	args: {
		previewArrow: { x1: 60, y1: 240, x2: 420, y2: 120, seed: 1 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		defaults: {
			line: "curve",
			startCap: "dot",
			endCap: "arrow",
			color: PRESET_COLORS[2],
			thickness: "lg",
			style: "clean",
		},
	},
};

/**
 * 細線 (`sm`) + 短い矢印。最小長 (8px) を超えた直後の見え方と、細線でも
 * 矢頭の向きが読めるかを確認する。
 * @summary 細線・短矢印
 */
export const Thin: Story = {
	args: {
		previewArrow: { x1: 180, y1: 160, x2: 280, y2: 120, seed: 1 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		defaults: {
			line: "straight",
			startCap: "none",
			endCap: "arrow",
			color: PRESET_COLORS[3],
			thickness: "sm",
			style: "clean",
		},
	},
};
