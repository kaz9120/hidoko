import type { Meta, StoryObj } from "@storybook/react-vite";

import { Separator } from "./separator";

/**
 * 視覚的に要素を区切る 1 本線。意味的な区切りでなく見た目の整理が目的なら
 * `decorative` のままで使い、スクリーンリーダから無視させる。
 * 縦線として使うときは `orientation="vertical"` に切り替える。
 *
 * @summary 要素を区切る 1 本線
 */
const meta = {
	title: "shadcn-ui/Separator",
	component: Separator,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 縦に積まれたテキストを横線で区切る基本形。リストの行間や、
 * セクションのまとまりを少し離したいときに使う。
 * @summary 横線で区切る形
 */
export const Default: Story = {
	render: () => (
		<div className="w-[260px]">
			<div className="text-sm">三軒茶屋の夜</div>
			<Separator className="my-3" />
			<div className="text-sm text-muted-foreground">火床、珈琲、本</div>
		</div>
	),
};

/**
 * `orientation="vertical"` で縦線として使う形。インラインで並ぶ
 * メタ情報の間に細く挟むのに向く。
 * @summary 縦線で区切る形
 */
export const Vertical: Story = {
	render: () => (
		<div className="flex h-6 items-center gap-3 text-sm">
			<span>夜</span>
			<Separator orientation="vertical" />
			<span>火</span>
			<Separator orientation="vertical" />
			<span>本</span>
		</div>
	),
};
