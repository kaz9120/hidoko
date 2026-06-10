import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "ui/components/tooltip";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { ArrowToolbar } from "./arrow-toolbar";

/**
 * 矢印ツール選択中だけ現れる 38px の context row。線形 (直線 / 曲線)、
 * 始点・終点の端点スタイル (なし / 矢印 / 丸)、色スウォッチ (矩形と共通の
 * プリセット 6 色)、太さ 3 段階を選ぶ。矢印が選択されているときはその矢印の
 * プロパティを書き換え、未選択のときは「次に描く矢印のデフォルト」を
 * 書き換える (rect-toolbar と同じ規約)。
 *
 * 実装は `image` が `null` または `activeTool !== "arrow"` のとき null を
 * 返すので、Storybook の empty 状態では何も描画されない。
 *
 * @summary 矢印アノテーション用のサブツールバー
 */
const meta = {
	title: "snapcrop/Layout/ArrowToolbar",
	component: ArrowToolbar,
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
} satisfies Meta<typeof ArrowToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像未ロード時。実装上 toolbar は描画されない。実画面でこの行が現れるのは、
 * 画像取り込み後に矢印ツールへ切り替えた瞬間。
 * @summary 画像未ロード時 (非表示)
 */
export const Default: Story = {};
