import type { Meta, StoryObj } from "@storybook/react-vite";

import { Footer } from "./footer";

/**
 * ページ最下部のフッタ。ロゴ + サイト名と X への導線、最後に年号付きの
 * コピーライトを並べる。年号は描画時の `new Date().getFullYear()` を使う
 * ため、story を開いたタイミングの年が出る。
 *
 * @summary ロゴ・X 導線・コピーライトの 3 段フッタ
 */
const meta = {
	title: "homepage/Footer",
	component: Footer,
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の表示。本番ページの最下端に置かれるレイアウトをそのまま見る。
 * @summary 既定の表示
 */
export const Default: Story = {};
