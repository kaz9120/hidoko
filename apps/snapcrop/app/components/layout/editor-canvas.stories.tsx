import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "ui/components/tooltip";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { EditorCanvas } from "./editor-canvas";

/**
 * snapcrop の本体。画像が入っていれば cropper / 矩形 / viewport を載せた
 * キャンバスを、入っていなければ空状態ヒーロー (`EmptyHero`) を全面で見せる。
 * clipboard 貼り付け / file drop / コピーや select-all のショートカットなど、
 * 画像取り込み周辺の hook もここで束ねている。
 *
 * Storybook 側からは画像 blob を流し込めないので、empty state での確認に
 * 留める。実画像が乗った状態の確認は実画面 (dev サーバ) で行う。
 *
 * @summary 画像編集キャンバス本体
 */
const meta = {
	title: "snapcrop/Layout/EditorCanvas",
	component: EditorCanvas,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="dark">
				<SnapcropProvider>
					<TooltipProvider>
						<div className="flex h-[480px] flex-col bg-[var(--ink-0)]">
							<Story />
						</div>
					</TooltipProvider>
				</SnapcropProvider>
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof EditorCanvas>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像未ロード時の空状態ヒーロー (`EmptyHero`)。ロゴ + コピー、
 * ショートカット案内、ドラッグ＆ドロップ案内が中央に立つ。ドラッグ中の
 * 見た目の変化は EmptyHero 単体の story (Dragging) で確認できる。
 * @summary 画像未ロード時の空状態ヒーロー
 */
export const Default: Story = {};
