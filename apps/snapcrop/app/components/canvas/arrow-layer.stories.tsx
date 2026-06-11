import type { Meta, StoryObj } from "@storybook/react-vite";

import type { ArrowAnnotation } from "~/lib/arrow-engine";
import { PRESET_COLORS } from "~/lib/rect-engine";

import { ArrowLayer } from "./arrow-layer";

/**
 * 画像座標系の `viewBox` を張った SVG レイヤーで、矢印アノテーションを
 * 重ね描きする pure presentational component。直線 / 曲線 (quadratic bezier)、
 * 端点キャップ (なし / 矢印 / 丸) を arrow-engine の描画モデル経由で描くので、
 * canvas エクスポートと同じ見た目になる。pointer event は通さない。
 *
 * @summary 矢印 annotation の SVG 描画レイヤー
 */
const meta = {
	title: "snapcrop/Canvas/ArrowLayer",
	component: ArrowLayer,
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
} satisfies Meta<typeof ArrowLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 360;

const mkArrow = (
	id: string,
	overrides: Partial<ArrowAnnotation>,
): ArrowAnnotation => ({
	id,
	kind: "arrow",
	x1: 0,
	y1: 0,
	x2: 100,
	y2: 60,
	line: "straight",
	startCap: "none",
	endCap: "arrow",
	color: PRESET_COLORS[0],
	thickness: "md",
	createdAt: Date.now(),
	...overrides,
});

/**
 * デフォルト設定の矢印 1 本。直線 + 終点だけ矢頭で、写真の一部を
 * 「指差す」基本の用途。
 * @summary 直線矢印 単体
 */
export const StraightArrow: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		arrows: [mkArrow("a1", { x1: 80, y1: 80, x2: 360, y2: 240 })],
	},
};

/**
 * 曲線 (quadratic bezier)。始点・終点の中点を法線方向に膨らませた制御点
 * 1 つだけのシンプルな実装。矢頭の向きは曲線端点の接線に追従する。
 * @summary 曲線矢印
 */
export const CurvedArrow: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		arrows: [
			mkArrow("c1", {
				x1: 60,
				y1: 280,
				x2: 400,
				y2: 100,
				line: "curve",
				color: PRESET_COLORS[1],
			}),
		],
	},
};

/**
 * 端点キャップの組み合わせ比較。上から「なし + 矢印 (デフォルト)」
 * 「矢印 + 矢印 (両向き)」「丸 + 矢印」「丸 + 丸」。
 * @summary 端点スタイル比較
 */
export const CapVariants: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		arrows: [
			mkArrow("v1", { x1: 60, y1: 60, x2: 420, y2: 60 }),
			mkArrow("v2", {
				x1: 60,
				y1: 140,
				x2: 420,
				y2: 140,
				startCap: "arrow",
				color: PRESET_COLORS[2],
			}),
			mkArrow("v3", {
				x1: 60,
				y1: 220,
				x2: 420,
				y2: 220,
				startCap: "dot",
				color: PRESET_COLORS[3],
			}),
			mkArrow("v4", {
				x1: 60,
				y1: 300,
				x2: 420,
				y2: 300,
				startCap: "dot",
				endCap: "dot",
				color: PRESET_COLORS[4],
			}),
		],
	},
};

/**
 * thickness を `sm` / `md` / `lg` で並べた比較。stroke-width だけでなく
 * 矢頭・丸キャップのサイズも太さに連動して大きくなる。
 * @summary 太さ比較
 */
export const ThicknessVariants: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		arrows: [
			mkArrow("sm", {
				x1: 60,
				y1: 80,
				x2: 420,
				y2: 80,
				thickness: "sm",
				color: PRESET_COLORS[1],
			}),
			mkArrow("md", {
				x1: 60,
				y1: 180,
				x2: 420,
				y2: 180,
				thickness: "md",
				color: PRESET_COLORS[2],
			}),
			mkArrow("lg", {
				x1: 60,
				y1: 280,
				x2: 420,
				y2: 280,
				thickness: "lg",
				color: PRESET_COLORS[3],
			}),
		],
	},
};

/**
 * arrow が空の状態。SVG だけが残り、何も描画されない。新規画像を開いた
 * 直後 / 全削除直後の見え方確認用。
 * @summary 空配列
 */
export const Empty: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		arrows: [],
	},
};
