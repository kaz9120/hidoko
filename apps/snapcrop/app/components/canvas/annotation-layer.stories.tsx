import type { Meta, StoryObj } from "@storybook/react-vite";

import type { RectAnnotation } from "~/lib/rect-engine";

import { AnnotationLayer } from "./annotation-layer";

/**
 * 画像座標系の `viewBox` を張った SVG レイヤーで、`outline` と `fill` の矩形を
 * 重ね描きする pure presentational component。`mosaic` は別レイヤー (MosaicLayer)
 * の担当なのでここでは描画しない。pointer event は通さない。
 *
 * @summary 矩形 annotation の SVG 描画レイヤー
 */
const meta = {
	title: "snapcrop/Canvas/AnnotationLayer",
	component: AnnotationLayer,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story) => (
			<div className="relative h-[360px] w-[480px] overflow-hidden rounded-md border border-border bg-bg-raised">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof AnnotationLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 360;

const mkRect = (
	id: string,
	overrides: Partial<RectAnnotation>,
): RectAnnotation => ({
	id,
	kind: "rect",
	x: 0,
	y: 0,
	width: 100,
	height: 60,
	style: "outline",
	color: "#ef4444",
	thickness: "md",
	createdAt: Date.now(),
	...overrides,
});

/**
 * outline スタイル単体。Hidoko の ember 系を使った 1 本の枠線で、写真の
 * 一部を「指差す」用途を想定する。
 * @summary outline 単体
 */
export const OutlineOnly: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		annotations: [
			mkRect("a1", {
				x: 80,
				y: 60,
				width: 220,
				height: 140,
				style: "outline",
				color: "#ef4444",
				thickness: "md",
			}),
		],
	},
};

/**
 * thickness を `sm` / `md` / `lg` で並べた比較。stroke-width が画像座標で
 * 直接効くので、viewBox 経由でも崩れずに段差が出る。
 * @summary 太さ比較
 */
export const ThicknessVariants: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		annotations: [
			mkRect("sm", {
				x: 20,
				y: 40,
				width: 120,
				height: 80,
				thickness: "sm",
				color: "#f47d3a",
			}),
			mkRect("md", {
				x: 170,
				y: 40,
				width: 120,
				height: 80,
				thickness: "md",
				color: "#facc15",
			}),
			mkRect("lg", {
				x: 320,
				y: 40,
				width: 120,
				height: 80,
				thickness: "lg",
				color: "#22c55e",
			}),
		],
	},
};

/**
 * fill スタイル。`FILL_OPACITY = 0.85` で塗り潰され、機密マスクや単純な
 * ハイライトに使う。outline と違って枠線は引かない。
 * @summary fill 塗り
 */
export const FillOnly: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		annotations: [
			mkRect("f1", {
				x: 60,
				y: 80,
				width: 180,
				height: 120,
				style: "fill",
				color: "#1a0d05",
			}),
			mkRect("f2", {
				x: 280,
				y: 180,
				width: 140,
				height: 100,
				style: "fill",
				color: "#f47d3a",
			}),
		],
	},
};

/**
 * outline と fill を混ぜた典型的な編集途中。`mosaic` を 1 つ混ぜているが、
 * このレイヤー側では filter out されるので見た目には現れない。
 * @summary 複数 style の混在
 */
export const Mixed: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		annotations: [
			mkRect("o1", {
				x: 40,
				y: 40,
				width: 200,
				height: 120,
				style: "outline",
				color: "#ef4444",
				thickness: "md",
			}),
			mkRect("f1", {
				x: 260,
				y: 60,
				width: 180,
				height: 100,
				style: "fill",
				color: "#22c55e",
			}),
			mkRect("m1", {
				x: 120,
				y: 220,
				width: 240,
				height: 100,
				style: "mosaic",
				color: "#3b82f6",
			}),
		],
	},
};

/**
 * annotation が空の状態。SVG だけが残り、何も描画されない。新規画像を
 * 開いた直後 / 全削除直後の見え方確認用。
 * @summary 空配列
 */
export const Empty: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		annotations: [],
	},
};
