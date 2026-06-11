import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "ui/components/tooltip";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { TextToolbar } from "./text-toolbar";

/**
 * テキストツール選択中だけ現れる 38px の context row。フォント (ゴシック /
 * 明朝 / 等幅)、サイズ (px 入力)、寄せ (左 / 中央 / 右)、太字 / 斜体、
 * 色スウォッチ (矩形・矢印と共通のプリセット 6 色)、背景 (なし / 白 / 黒) を
 * 選ぶ。テキストが選択されているときはそのテキストのプロパティを書き換え、
 * 未選択のときは「次に作るテキストのデフォルト」を書き換える (arrow-toolbar
 * と同じ規約)。
 *
 * 実装は `image` が `null` または `activeTool !== "text"` のとき null を
 * 返すので、Storybook の empty 状態では何も描画されない。
 *
 * @summary テキストアノテーション用のサブツールバー
 */
const meta = {
	title: "snapcrop/Layout/TextToolbar",
	component: TextToolbar,
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
} satisfies Meta<typeof TextToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像未ロード時。実装上 toolbar は描画されない。実画面でこの行が現れるのは、
 * 画像取り込み後にテキストツールへ切り替えた瞬間。
 * @summary 画像未ロード時 (非表示)
 */
export const Default: Story = {};
