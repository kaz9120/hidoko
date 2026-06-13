import type { Meta, StoryObj } from "@storybook/react-vite";

import { HighlightPreviewOverlay } from "./highlight-preview-overlay";

/**
 * マーカーツールでドラッグ中、まだ commit されていないハイライトを
 * プレビュー表示する SVG レイヤー。帯は半透明 + multiply が本来の見た目
 * なので、矢印のような破線化はせず、確定後と同じ描画をそのまま先取りする。
 * 色・不透明度・太さは現在の highlightDefaults を反映する。pointer event は
 * 通さず、見せるだけ。実 UI では `useHighlightEngine` の `previewHighlight`
 * が走る間だけ mount される。
 *
 * @summary 描画中のマーカープレビュー
 */
const meta = {
	title: "snapcrop/Canvas/HighlightPreviewOverlay",
	component: HighlightPreviewOverlay,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story) => (
			<div className="relative h-[300px] w-[480px] overflow-hidden rounded-md border border-border bg-[#f5efe4]">
				<div className="space-y-5 p-8 font-mono text-[#3a2f24] text-sm leading-6">
					<p>ドラッグ中のマーカーが上を通るテキスト。</p>
					<p>multiply 合成なので preview でも下の文字が読める。</p>
					<p>確定後 (HighlightLayer) と同じ見た目を先取りする。</p>
				</div>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof HighlightPreviewOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

const IMAGE_WIDTH = 480;
const IMAGE_HEIGHT = 300;

/**
 * 典型的なドラッグ中の状態。デフォルト設定 (黄 / 40% / md) の帯が
 * そのまま見える。`endInteraction` で commit されると HighlightLayer 側の
 * 描画に切り替わる (見た目は同一)。
 * @summary 描画中のプレビュー
 */
export const Default: Story = {
	args: {
		previewHighlight: { x1: 28, y1: 44, x2: 380, y2: 44 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		defaults: {
			color: "#fde047",
			opacity: 0.4,
			thickness: "md",
			strokeStyle: "clean",
		},
	},
};

/**
 * 太帯 (`lg`) + 高不透明度 (80%) + ピンクでのプレビュー。濃いめ設定でも
 * multiply のおかげで下の文字が潰れない。
 * @summary 太帯・高不透明度でのプレビュー
 */
export const ThickOpaque: Story = {
	args: {
		previewHighlight: { x1: 28, y1: 88, x2: 420, y2: 88 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		defaults: {
			color: "#f9a8d4",
			opacity: 0.8,
			thickness: "lg",
			strokeStyle: "clean",
		},
	},
};

/**
 * 細帯 (`sm`) + 斜めの短いドラッグ。最小長 (8px) を超えた直後の見え方確認用。
 * @summary 細帯・短いプレビュー
 */
export const Thin: Story = {
	args: {
		previewHighlight: { x1: 180, y1: 200, x2: 280, y2: 160 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		defaults: {
			color: "#93c5fd",
			opacity: 0.4,
			thickness: "sm",
			strokeStyle: "clean",
		},
	},
};

/**
 * 手書き風 (`sketchy`) の太帯プレビュー。揺らぎが帯の縦方向にも出るので、
 * 蛍光ペンを少しよれて引いたような印象になる。
 * @summary sketchy プレビュー
 */
export const Sketchy: Story = {
	args: {
		previewHighlight: { x1: 28, y1: 132, x2: 420, y2: 132 },
		imageWidth: IMAGE_WIDTH,
		imageHeight: IMAGE_HEIGHT,
		defaults: {
			color: "#bef264",
			opacity: 0.5,
			thickness: "md",
			strokeStyle: "sketchy",
		},
	},
};
