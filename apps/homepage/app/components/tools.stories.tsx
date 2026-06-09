import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tools } from "./tools";

/**
 * 自作ツールの一覧。`~/data/tools.ts` の `TOOLS` を縦積みのカードで並べ、
 * `accent` フラグの立った項目はボーダーをアクセント色で強める。
 * 各カードはツール本体への外部リンクとして機能する。
 *
 * @summary 自作ツール一覧
 */
const meta = {
	title: "homepage/Tools",
	component: Tools,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Tools>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の表示。TOOLS の全件をそのまま並べる。
 * @summary 既定の表示
 */
export const Default: Story = {};
