import type { Meta, StoryObj } from "@storybook/react-vite";

import { MediaList } from "./media-list";

/**
 * インタビュー・ポッドキャスト・YouTube などの掲載・出演一覧。
 * `~/data/media.ts` の `MEDIA` を縦積みのカード列にまとめ、種別ごとに
 * アイコンと色を切り替える。データが空のときは `<EmptyState>` を出す。
 *
 * @summary 掲載・出演一覧（種別アイコン付き）
 */
const meta = {
	title: "homepage/MediaList",
	component: MediaList,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof MediaList>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の表示。MEDIA に登録された全件を上から並べる。
 * @summary 既定の表示
 */
export const Default: Story = {};
