import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "ui/components/tooltip";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { SettingsDialog } from "./settings-dialog";

/**
 * ヘッダ右クラスタの設定ボタン。押すと設定ダイアログが開く。最初の中身は
 * 矩形ツールのデフォルト値 (スタイル / 色 / 太さ) で、保存すると localStorage
 * に永続化される。`SnapcropContext` を購読しているため、Storybook では
 * `SnapcropProvider` で wrap する。
 *
 * 守りの UX:
 *   - 外タップ / Esc は抑止し、閉じる経路を X / キャンセル / 保存に限定する
 *   - 編集途中で閉じようとしたら「変更を破棄しますか?」を確認する
 *
 * @summary 設定ボタンと設定ダイアログ
 */
const meta = {
	title: "snapcrop/SettingsDialog",
	component: SettingsDialog,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<SnapcropProvider>
				<TooltipProvider>
					<Story />
				</TooltipProvider>
			</SnapcropProvider>
		),
	],
} satisfies Meta<typeof SettingsDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 初期表示は歯車アイコンのボタンだけ。クリックすると矩形デフォルト値の
 * 編集フォームが開く。スタイルを mosaic にすると色が、fill にすると太さが
 * disable される (RectToolbar と同じ規則)。値を変えてから外タップ / Esc を
 * 試すと破棄確認が出る挙動も Storybook 上で確認できる。
 * @summary 設定ボタン (クリックでダイアログが開く)
 */
export const Default: Story = {};
