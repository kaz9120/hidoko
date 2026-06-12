import type { Meta, StoryObj } from "@storybook/react-vite";

import type { TextAnnotation } from "~/lib/text-engine";

import { TextLayer } from "./text-layer";

/**
 * 画像座標系の `viewBox` を張った SVG レイヤーで、テキストアノテーションを
 * 重ね描きする pure presentational component。フォント (sans / serif / mono)、
 * 寄せ (左 / 中央 / 右)、太字 / 斜体、背景 (なし / 白 / 黒)、複数行を
 * text-engine の描画モデル経由で描くので、canvas エクスポートと同じ見た目に
 * なる。pointer event は通さない。
 *
 * @summary テキスト annotation の SVG 描画レイヤー
 */
const meta = {
	title: "snapcrop/Canvas/TextLayer",
	component: TextLayer,
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
} satisfies Meta<typeof TextLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 360;

const mkText = (
	id: string,
	overrides: Partial<TextAnnotation>,
): TextAnnotation => ({
	id,
	kind: "text",
	x: 40,
	y: 40,
	text: "テキスト",
	fontFamily: "sans",
	fontSize: 24,
	align: "left",
	bold: false,
	italic: false,
	color: "#ef4444",
	background: "none",
	createdAt: Date.now(),
	zIndex: 0,
	...overrides,
});

/**
 * デフォルト設定のテキスト 1 つ。sans 24px・左寄せ・背景なしで、
 * スクリーンショットに短い注記を載せる基本の用途。
 * @summary 単体テキスト
 */
export const Default: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		texts: [mkText("t1", { x: 60, y: 120, text: "ここに注目" })],
	},
};

/**
 * フォント 3 種 (ゴシック / 明朝 / 等幅) の比較。Web フォントは動的ロード
 * せず、システムフォントの generic スタックで賄う。
 * @summary フォント比較
 */
export const FontVariants: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		texts: [
			mkText("sans", { y: 50, text: "ゴシック sans 123" }),
			mkText("serif", {
				y: 140,
				text: "明朝 serif 123",
				fontFamily: "serif",
				color: "#f47d3a",
			}),
			mkText("mono", {
				y: 230,
				text: "等幅 mono 123",
				fontFamily: "mono",
				color: "#facc15",
			}),
		],
	},
};

/**
 * 太字 / 斜体 / 太字斜体の組み合わせと、背景 (白 / 黒) の見え方。背景は
 * 画像へ焼き込む注釈の機能色なので、純白 / 純黒を使う (DESIGN.md の純白禁止
 * は UI クロームが対象)。
 * @summary スタイルと背景の比較
 */
export const StyleAndBackground: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		texts: [
			mkText("bold", { y: 40, text: "太字", bold: true }),
			mkText("italic", { x: 180, y: 40, text: "斜体", italic: true }),
			mkText("both", {
				x: 320,
				y: 40,
				text: "太字斜体",
				bold: true,
				italic: true,
			}),
			mkText("bg-white", {
				y: 140,
				text: "背景: 白",
				color: "#3b82f6",
				background: "white",
			}),
			mkText("bg-black", {
				y: 230,
				text: "背景: 黒",
				color: "#ffffff",
				background: "black",
			}),
		],
	},
};

/**
 * 複数行 (改行) と寄せの組み合わせ。アンカー x は align=left なら各行の
 * 左端、center なら中央、right なら右端で、canvas の textAlign と同じ規約。
 * @summary 複数行と寄せ
 */
export const MultilineAlign: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		texts: [
			mkText("left", {
				x: 40,
				y: 40,
				text: "左寄せ\n2 行目が長いケース",
				fontSize: 18,
			}),
			mkText("center", {
				x: 240,
				y: 150,
				text: "中央寄せ\n2 行目が長いケース",
				fontSize: 18,
				align: "center",
				color: "#22c55e",
			}),
			mkText("right", {
				x: 440,
				y: 260,
				text: "右寄せ\n2 行目が長いケース",
				fontSize: 18,
				align: "right",
				color: "#3b82f6",
			}),
		],
	},
};

/**
 * texts が空の状態。SVG だけが残り、何も描画されない。新規画像を開いた
 * 直後 / 全削除直後の見え方確認用。
 * @summary 空配列
 */
export const Empty: Story = {
	args: {
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		texts: [],
	},
};
