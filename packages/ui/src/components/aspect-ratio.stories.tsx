import type { Meta, StoryObj } from "@storybook/react-vite";

import { AspectRatio } from "./aspect-ratio";

/**
 * 中身を指定した縦横比に保つ箱。サムネイル枠や動画埋め込み、
 * カバー画像のプレースホルダなど、可変幅でも比率を崩したくないときに使う。
 *
 * @summary 縦横比を保つ枠
 */
const meta = {
	title: "shadcn-ui/AspectRatio",
	component: AspectRatio,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof AspectRatio>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 16:9 のカバー画像枠。中身を `object-cover` で流し込み、
 * 親の幅に追従しても比率を守る。
 * @summary 16:9 のカバー枠
 */
export const Default: Story = {
	render: () => (
		<div className="w-[420px]">
			<AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md border">
				<div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
					三軒茶屋の夜 (16:9)
				</div>
			</AspectRatio>
		</div>
	),
};
