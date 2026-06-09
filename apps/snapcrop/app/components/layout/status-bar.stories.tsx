import type { Meta, StoryObj } from "@storybook/react-vite";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { StatusBar } from "./status-bar";

/**
 * 画面下端 24px の細い情報帯。画像のサイズ・形式・選択範囲・履歴位置を
 * 等幅フォントで横一列に詰める。火床の夜に光る計器盤のような立ち位置で、
 * 視線を奪わず、必要なときだけ目で拾える。
 *
 * `SnapcropContext` から `image` / `cropData` / `historyIndex` を読むので、
 * Storybook では `SnapcropProvider` で wrap する。
 *
 * @summary 画面下端のステータスバー
 */
const meta = {
	title: "snapcrop/Layout/StatusBar",
	component: StatusBar,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<SnapcropProvider>
				<Story />
			</SnapcropProvider>
		),
	],
} satisfies Meta<typeof StatusBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像未ロードの初期状態。「画像が未ロードです」と「⌘V で貼り付け」だけが
 * 並ぶ最小表示。
 * @summary 画像未ロード時
 */
export const Default: Story = {};
