import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "ui/components/tooltip";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { SiteHeader } from "./site-header";

/**
 * snapcrop 画面最上段に貼り付くヘッダ。ロゴ・取り込み手段 (スクショ / 貼り付け
 * / ファイル)・編集系コントロール (ズーム / undo / redo) を左に、ヘルプ /
 * テーマ切替 / 設定と、書き出し系 (PNG ダウンロード / コピー / X シェア) を
 * 右に並べる。`SnapcropContext` と `next-themes` の両方を購読しているため、
 * Storybook では両方の Provider で wrap する必要がある。
 *
 * @summary 画面上端のヘッダ
 */
const meta = {
	title: "snapcrop/Layout/SiteHeader",
	component: SiteHeader,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="dark">
				<SnapcropProvider>
					<TooltipProvider>
						<Story />
					</TooltipProvider>
				</SnapcropProvider>
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof SiteHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像未ロードの初期状態。undo / redo と書き出し系 (ダウンロード / コピー) は
 * disabled。取り込み系のアイコンだけが押せる。Storybook の世界では実際の
 * screen capture API や clipboard API は未承認のことが多く、ボタンを押しても
 * 画像は入らない。
 * @summary 画像未ロード時
 */
export const Default: Story = {};
