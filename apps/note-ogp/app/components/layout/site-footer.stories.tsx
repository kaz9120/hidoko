import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";

import { SiteFooter } from "./site-footer";

/**
 * 画面最下端の静的フッター。バージョン・法務リンク・サイト帰属だけを置き、
 * 背景を `--bg-sunken` で一段沈めてエディタ本体と視覚的に区切る。
 * 通常は 1 行 22px で、横幅が足りない小画面では折り返す。
 *
 * `/privacy` `/terms` への `<Link>` を含むので、story では MemoryRouter で
 * wrap する。
 *
 * @summary 画面最下端の静的フッター
 */
const meta = {
	title: "note-ogp/Layout/SiteFooter",
	component: SiteFooter,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
} satisfies Meta<typeof SiteFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 静的フッターなので状態の variant はない。バージョン・プライバシー
 * ポリシー・利用規約・帰属リンクが、十分な横幅では 1 行に収まることを
 * 確認する。
 * @summary 既定の表示
 */
export const Default: Story = {};
