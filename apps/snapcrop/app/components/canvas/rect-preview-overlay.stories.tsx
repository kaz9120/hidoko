import type { Meta, StoryObj } from "@storybook/react-vite";

import { RectPreviewOverlay } from "./rect-preview-overlay";

/**
 * 矩形ツールでドラッグ中、まだ commit されていない rect を破線でプレビュー
 * 表示する SVG レイヤー。pointer event は通さず、見せるだけ。実 UI では
 * `useRectEngine` の `previewRect` が走る間だけ mount される。
 *
 * @summary 描画中の矩形プレビュー (破線)
 */
const meta = {
	title: "snapcrop/Canvas/RectPreviewOverlay",
	component: RectPreviewOverlay,
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
} satisfies Meta<typeof RectPreviewOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 300;

/**
 * 典型的なドラッグ中の状態。ember-400 相当の赤系破線で「未確定」を示す。
 * `endInteraction` で commit されると AnnotationLayer 側の実線に切り替わる。
 * @summary 描画中のプレビュー
 */
export const Default: Story = {
	args: {
		previewRect: { x: 80, y: 60, width: 240, height: 160 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		color: "#ef4444",
		thickness: "md",
	},
};

/**
 * 太線 (`lg`) でのプレビュー。dasharray は stroke-width に比例して伸びるので、
 * 太くしても破線パターンが読めるバランスが保たれる。
 * @summary 太線でのプレビュー
 */
export const Thick: Story = {
	args: {
		previewRect: { x: 60, y: 50, width: 320, height: 180 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		color: "#facc15",
		thickness: "lg",
	},
};

/**
 * 細線 (`sm`) + 小さな矩形。clip しすぎて潰れないか、最小サイズ近くで
 * 破線パターンが読めるかを確認する。
 * @summary 細線・小矩形
 */
export const Thin: Story = {
	args: {
		previewRect: { x: 120, y: 100, width: 80, height: 60 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		color: "#22c55e",
		thickness: "sm",
	},
};
