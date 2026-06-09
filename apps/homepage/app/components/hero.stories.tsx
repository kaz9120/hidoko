import type { Meta, StoryObj } from "@storybook/react-vite";

import { Hero } from "./hero";

/**
 * homepage トップの first view。`<hi-embers>` の火の粉、巨大な氏名タイポ、
 * アクセント色のキャッチコピーを束ねた看板要素。1 ページに 1 つ前提。
 *
 * 中の値（氏名 / 所属 / キャッチ）は `~/data/profile.ts` の `PROFILE` を直接
 * 参照するため、story では prop での差し替えはできない。「文言を差し替えた版
 * を見たい」というときは PROFILE 側を編集する。
 *
 * @summary トップ first view
 */
const meta = {
	title: "homepage/Hero",
	component: Hero,
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof Hero>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の表示。`useEmbers()` の副作用で `<hi-embers>` が customElements に
 * 登録され、火の粉が舞う。
 * @summary 既定の表示
 */
export const Default: Story = {};
