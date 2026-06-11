import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "ui/components/tooltip";

import { ExportActionsView } from "./export-actions";

/**
 * ヘッダー右端に常駐する書き出しアクション群。PNG ダウンロードのアイコン
 * ボタンと、プライマリの「コピー」ボタン (⌘C 表示付き) を並べる。クロップ
 * 結果に注釈を焼き込んで書き出す。
 *
 * 実画面では `ExportActions` (context 接続版) が SnapcropContext の画像と
 * 注釈を参照する。Storybook では props 駆動の `ExportActionsView` で見た目を
 * 確認する。
 *
 * @summary ヘッダー右端の書き出しアクション
 */
const meta = {
	title: "snapcrop/Layout/ExportActions",
	component: ExportActionsView,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<TooltipProvider>
				<div className="flex items-center rounded-md bg-background px-4 py-2">
					<Story />
				</div>
			</TooltipProvider>
		),
	],
} satisfies Meta<typeof ExportActionsView>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像ロード済みの基本形。ダウンロードはアイコンのみ、コピーはプライマリで
 * ⌘C のキーボードショートカット表示を添える。
 * @summary 画像ロード済みの基本形
 */
export const Default: Story = {
	args: {
		onCopy: () => {},
		onDownload: () => {},
	},
};

/**
 * 画像未ロード時。site-header 上では `ExportActions` が context の image を
 * 見て全体を disabled にする。
 * @summary 画像未ロード時 (disabled)
 */
export const Disabled: Story = {
	args: {
		disabled: true,
		onCopy: () => {},
		onDownload: () => {},
	},
};
