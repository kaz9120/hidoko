import type { Meta, StoryObj } from "@storybook/react-vite";

import { Decks } from "./decks";

/**
 * 登壇資料の一覧。`~/data/decks.ts` の `DECKS` から `featured` フラグの立った
 * 1 件を大きく見せ、残りをカードグリッドに並べる。データが空のときは
 * 内部で `<EmptyState>` を出す。
 *
 * @summary 登壇資料の一覧（featured + grid）
 */
const meta = {
	title: "homepage/Decks",
	component: Decks,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Decks>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の表示。DECKS にあるデータをそのまま描画する。
 * @summary 既定の表示
 */
export const Default: Story = {};
