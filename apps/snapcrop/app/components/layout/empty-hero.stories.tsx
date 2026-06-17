import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";

import { EmptyHero } from "./empty-hero";

/**
 * 画像未ロード時に editor 全面へ出すヒーロー。ロゴ + 1 行コピー
 * (「スクショを瞬時にクリップボードへ。」)、キャプチャ / 貼り付けの
 * ショートカット案内、ドラッグ＆ドロップ対応の明示、powered by 表記を載せる。
 *
 * ショートカット表記は Apple 系プラットフォームなら ⌘、それ以外なら
 * Win / Ctrl に出し分ける (Storybook では閲覧環境の表記になる)。
 *
 * @summary 画像未ロード時の空状態ヒーロー
 */
const meta = {
	title: "snapcrop/Layout/EmptyHero",
	component: EmptyHero,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="dark">
				<div className="flex h-[480px] flex-col bg-[var(--ink-0)]">
					<Story />
				</div>
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof EmptyHero>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 初期表示。点線枠の中央にロゴとコピーが立ち、その下にショートカット案内と
 * ドラッグ＆ドロップの案内、下端に powered by 表記が並ぶ。
 * @summary 初期表示
 */
export const Default: Story = {
	args: {
		isDragging: false,
	},
};

/**
 * ファイルをドラッグして枠に近づけた状態。点線枠が accent 色に染まり、
 * 案内文が「ここにドロップして取り込み」へ切り替わる。
 * @summary ドラッグ中
 */
export const Dragging: Story = {
	args: {
		isDragging: true,
	},
};
