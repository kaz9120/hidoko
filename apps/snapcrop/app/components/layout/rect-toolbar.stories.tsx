import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "ui/components/tooltip";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { RectToolbar } from "./rect-toolbar";

/**
 * 矩形ツール選択中だけ現れる 38px の context row。スタイル (枠線 / 塗り /
 * モザイク)、色スウォッチ、太さ (またはモザイクのブロックサイズ) を選ぶ。
 * 矩形が選択されているときはその矩形のプロパティを書き換え、未選択のときは
 * 「次に描く矩形のデフォルト」を書き換える。
 *
 * スタイルによって他コントロールの有効/無効が連動する:
 *   - fill   : 太さ disabled
 *   - mosaic : 色 disabled、太さラベルが「ブロック」に変わる
 *
 * 実装は `image` が `null` または `activeTool !== "rect"` のとき null を
 * 返すので、Storybook の empty 状態では何も描画されない。
 *
 * @summary 矩形アノテーション用のサブツールバー
 */
const meta = {
	title: "snapcrop/Layout/RectToolbar",
	component: RectToolbar,
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
} satisfies Meta<typeof RectToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像未ロード時。実装上 toolbar は描画されない。実画面でこの行が現れるのは、
 * 画像取り込み後に矩形ツールへ切り替えた瞬間。
 * @summary 画像未ロード時 (非表示)
 */
export const Default: Story = {};
