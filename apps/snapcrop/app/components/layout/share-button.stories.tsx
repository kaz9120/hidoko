import type { Meta, StoryObj } from "@storybook/react-vite";

import { ShareButton } from "./share-button";

/**
 * ヘッダー 1 段目右側に置く X シェアチップ。X ロゴ + 「シェア」ラベルで、
 * クリックすると X の web intent (`twitter.com/intent/tweet`) を新規タブで
 * 開く。事前入力テキストは「体験のシェア」構文で、本文に作者 mention と
 * `?ref=share` 付きのアプリ URL を含む。
 *
 * @summary X シェアチップ
 */
const meta = {
	title: "snapcrop/Layout/ShareButton",
	component: ShareButton,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof ShareButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の表示。状態を持たないチップなので variant はこれ 1 つ。クリックすると
 * 新規タブで X の投稿画面が開く (Storybook 上でもそのまま動く)。
 * @summary 既定の表示
 */
export const Default: Story = {};
