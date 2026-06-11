import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "ui/components/tooltip";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { CropToolbar } from "./crop-toolbar";

/**
 * クロップツールを選択しているときだけ現れる 38px の context row。
 * 幅・高さの数値入力、向き反転、アスペクト比プリセット (自由 / 1:1 / 16:9 /
 * φ / √2 など) を 1 列に並べ、右端に配置系の操作 (中央寄せ / 全画面 /
 * リセット) を置く。状態は `SnapcropContext` 側に持たせていて、ツール切替で
 * 値が消えない。
 *
 * 右端の 3 ボタンの挙動:
 *   - 中央寄せ : 選択サイズを維持したまま画像中央へ移動
 *   - 全画面   : ⌘A と同じ。比率ロック中は画像内に収まる最大の比率矩形
 *   - リセット : 画像取り込み直後の状態 (自由比率・横向き・全選択) に戻す
 *
 * 実装は `image` が `null` または `activeTool !== "crop"` のとき null を
 * 返すので、Storybook の empty 状態では何も描画されない (画像差し込みは
 * 実画面で確認する)。
 *
 * @summary クロップ用のサブツールバー
 */
const meta = {
	title: "snapcrop/Layout/CropToolbar",
	component: CropToolbar,
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
} satisfies Meta<typeof CropToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像未ロード時。実装上 toolbar は描画されない。実画面でこの行が現れるのは、
 * 画像を取り込んでクロップツールを選んだ後。
 * @summary 画像未ロード時 (非表示)
 */
export const Default: Story = {};
