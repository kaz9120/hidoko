import type { Meta, StoryObj } from "@storybook/react-vite";

import { NotePicks } from "./note-picks";

/**
 * note 記事のピックアップ。`~/data/notes.ts` の `NOTE_PICKS` から
 * `featured` フラグの 1 件を大きく見せ、残りを 2 列のカードグリッドに
 * 並べる。データが空のときは `<EmptyState>` を出す。
 *
 * @summary note 記事のピックアップ
 */
const meta = {
	title: "homepage/NotePicks",
	component: NotePicks,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof NotePicks>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の表示。NOTE_PICKS の中身をそのまま並べる。
 * @summary 既定の表示
 */
export const Default: Story = {};
