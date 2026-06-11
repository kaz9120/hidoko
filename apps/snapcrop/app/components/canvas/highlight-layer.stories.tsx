import type { Meta, StoryObj } from "@storybook/react-vite";

import type { HighlightAnnotation } from "~/lib/highlight-engine";

import { HighlightLayer } from "./highlight-layer";

/**
 * 画像座標系の `viewBox` を張った SVG レイヤーで、マーカー (ハイライト)
 * アノテーションを重ね描きする pure presentational component。蛍光ペンの
 * 重ね味は帯ごとの `mix-blend-mode: multiply` + 不透明度で出し、canvas
 * エクスポート (multiply の逐次描画) と同じ見た目になる。pointer event は
 * 通さない。
 *
 * @summary マーカー annotation の SVG 描画レイヤー
 */
const meta = {
	title: "snapcrop/Canvas/HighlightLayer",
	component: HighlightLayer,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story) => (
			<div className="relative h-[360px] w-[480px] overflow-hidden rounded-md border border-border bg-[#f5efe4]">
				{/* multiply の重ね味が分かるよう、下にダミーの「文字」を敷く */}
				<div className="space-y-5 p-8 font-mono text-[#3a2f24] text-sm leading-6">
					<p>焚き火を愛するエンジニアのための画像エディタ。</p>
					<p>マーカーは下の文字が透ける。multiply 合成の確認用テキスト。</p>
					<p>snapcrop / hidoko monorepo / highlight tool fixture.</p>
					<p>黄・橙・緑・青・ピンクの蛍光 5 色を重ねて検証する。</p>
					<p>帯の端は butt cap でペン先らしい四角い切り口になる。</p>
				</div>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof HighlightLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 360;

const mkHighlight = (
	id: string,
	overrides: Partial<HighlightAnnotation>,
): HighlightAnnotation => ({
	id,
	kind: "highlight",
	x1: 0,
	y1: 0,
	x2: 100,
	y2: 60,
	color: "#fde047",
	opacity: 0.4,
	thickness: "md",
	createdAt: Date.now(),
	...overrides,
});

/**
 * デフォルト設定 (黄 / 40% / md) のマーカー 1 本。文字列の上を水平になぞる
 * 基本の用途。下の文字が multiply で透けて読める。
 * @summary 黄マーカー 単体
 */
export const Default: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		highlights: [mkHighlight("h1", { x1: 28, y1: 44, x2: 360, y2: 44 })],
	},
};

/**
 * 蛍光 5 色 (黄 / 橙 / 緑 / 青 / ピンク) の比較。multiply 合成なので、
 * どの色でも下の文字が沈まずに読める。
 * @summary 蛍光パレット 5 色比較
 */
export const PaletteVariants: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		highlights: [
			mkHighlight("p1", { x1: 28, y1: 44, x2: 420, y2: 44, color: "#fde047" }),
			mkHighlight("p2", { x1: 28, y1: 88, x2: 420, y2: 88, color: "#fdba74" }),
			mkHighlight("p3", {
				x1: 28,
				y1: 132,
				x2: 420,
				y2: 132,
				color: "#bef264",
			}),
			mkHighlight("p4", {
				x1: 28,
				y1: 176,
				x2: 420,
				y2: 176,
				color: "#93c5fd",
			}),
			mkHighlight("p5", {
				x1: 28,
				y1: 220,
				x2: 420,
				y2: 220,
				color: "#f9a8d4",
			}),
		],
	},
};

/**
 * thickness を `sm` / `md` / `lg` で並べた比較。帯幅は 12 / 20 / 32px。
 * 不透明度はどれも 40% のまま。
 * @summary 太さ比較
 */
export const ThicknessVariants: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		highlights: [
			mkHighlight("sm", { x1: 28, y1: 44, x2: 420, y2: 44, thickness: "sm" }),
			mkHighlight("md", { x1: 28, y1: 132, x2: 420, y2: 132, thickness: "md" }),
			mkHighlight("lg", { x1: 28, y1: 222, x2: 420, y2: 222, thickness: "lg" }),
		],
	},
};

/**
 * 不透明度 20% / 40% / 80% の比較と、帯同士の重なり。multiply の逐次合成
 * なので、重なった部分は段階的に濃くなる (実エクスポートと同じ挙動)。
 * @summary 不透明度比較と重なり
 */
export const OpacityAndOverlap: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		highlights: [
			mkHighlight("o1", { x1: 28, y1: 44, x2: 420, y2: 44, opacity: 0.2 }),
			mkHighlight("o2", { x1: 28, y1: 88, x2: 420, y2: 88, opacity: 0.4 }),
			mkHighlight("o3", { x1: 28, y1: 132, x2: 420, y2: 132, opacity: 0.8 }),
			mkHighlight("o4", {
				x1: 60,
				y1: 250,
				x2: 300,
				y2: 180,
				color: "#93c5fd",
			}),
			mkHighlight("o5", {
				x1: 100,
				y1: 170,
				x2: 340,
				y2: 260,
				color: "#f9a8d4",
			}),
		],
	},
};

/**
 * highlight が空の状態。SVG だけが残り、何も描画されない。新規画像を開いた
 * 直後 / 全削除直後の見え方確認用。
 * @summary 空配列
 */
export const Empty: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		highlights: [],
	},
};
