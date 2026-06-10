import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "ui/components/tooltip";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { HighlightToolbar } from "./highlight-toolbar";

/**
 * マーカーツール選択中だけ現れる 38px の context row。蛍光 5 色
 * (黄 / 橙 / 緑 / 青 / ピンク) のスウォッチ、不透明度スライダー
 * (デフォルト 40%)、太さ 3 段階を選ぶ。ハイライトが選択されているときは
 * そのハイライトのプロパティを書き換え、未選択のときは「次に引くマーカーの
 * デフォルト」を書き換える (arrow-toolbar と同じ規約)。
 *
 * 実装は `image` が `null` または `activeTool !== "highlight"` のとき null を
 * 返すので、Storybook の empty 状態では何も描画されない。
 *
 * @summary マーカーアノテーション用のサブツールバー
 */
const meta = {
	title: "snapcrop/Layout/HighlightToolbar",
	component: HighlightToolbar,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<SnapcropProvider>
				<TooltipProvider>
					<div className="flex flex-col bg-[var(--ink-0)]">
						<Story />
						<div className="flex h-[120px] items-center justify-center text-muted-foreground text-sm">
							キャンバス領域 (story では未描画)
						</div>
					</div>
				</TooltipProvider>
			</SnapcropProvider>
		),
	],
} satisfies Meta<typeof HighlightToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像未ロード時。実装上 toolbar は描画されない。実画面でこの行が現れるのは、
 * 画像取り込み後にマーカーツールへ切り替えた瞬間。
 * @summary 画像未ロード時 (非表示)
 */
export const Default: Story = {};
