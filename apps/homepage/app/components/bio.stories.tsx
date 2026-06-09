import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bio } from "./bio";

/**
 * 自己紹介セクションの本体。`~/data/profile.ts` の `PROFILE.bioParts` を
 * 「仕事 / コミュニティ / 経歴 / 好きなもの」の 4 グループにまとめて
 * チップ状に並べる。文言の差し替えは PROFILE 側で行う。
 *
 * @summary 4 グループに分けた経歴チップ
 */
const meta = {
	title: "homepage/Bio",
	component: Bio,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Bio>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の表示。PROFILE.bioParts に登録されている全項目をグループごとに描画する。
 * @summary 既定の表示
 */
export const Default: Story = {};
