import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "ui/components/tooltip";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { EditorCanvas } from "./editor-canvas";

/**
 * snapcrop の本体。画像が入っていれば cropper / 矩形 / viewport を載せた
 * キャンバスを、入っていなければ「画像をドラッグ＆ドロップ」の empty state
 * を全面で見せる。clipboard 貼り付け / file drop / コピーや select-all の
 * ショートカットなど、画像取り込み周辺の hook もここで束ねている。
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
			<SnapcropProvider>
				<TooltipProvider>
					<div className="flex h-[480px] flex-col bg-[var(--ink-0)]">
						<Story />
					</div>
				</TooltipProvider>
			</SnapcropProvider>
		),
	],
} satisfies Meta<typeof EditorCanvas>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像未ロード時の empty state。点線の枠と「画像をドラッグ＆ドロップ」の
 * 案内が中央に立つ。ファイルをドラッグして枠に近づけたとき、枠と
 * アイコンが accent 色に染まる遷移は実画面でのみ確認できる。
 * @summary 画像未ロード時の empty state
 */
export const Default: Story = {};
