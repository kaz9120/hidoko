import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

/**
 * 利用者のアイコン。画像が読めるあいだは `AvatarImage`、失敗時は
 * `AvatarFallback` の頭文字に切り替わる。`size` で sm / default / lg を
 * 切り替えられる。
 *
 * @summary 利用者を示す円形アイコン
 */
const meta = {
	title: "shadcn-ui/Avatar",
	component: Avatar,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像が読めた状態。`AvatarImage` が正しい比率で収まる。
 * @summary 画像読み込み成功時
 */
export const Default: Story = {
	render: () => (
		<Avatar>
			<AvatarImage
				src="https://avatars.githubusercontent.com/u/9919?v=4"
				alt="GitHub"
			/>
			<AvatarFallback>GH</AvatarFallback>
		</Avatar>
	),
};

/**
 * 画像 URL が無い、または読み込みに失敗したとき。頭文字の `AvatarFallback`
 * が表示される。ネットワーク前提を持たない story として `src` を渡さない。
 * @summary 画像が無いときの fallback
 */
export const Fallback: Story = {
	render: () => (
		<Avatar>
			<AvatarFallback>KY</AvatarFallback>
		</Avatar>
	),
};
