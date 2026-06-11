import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollArea, ScrollBar } from "./scroll-area";
import { Separator } from "./separator";

/**
 * ブラウザ既定のスクロールバーを置き換える、独自スタイルの
 * スクロール領域。Radix の ScrollArea を Hidoko のトークン上に
 * 載せた wrapper。長文の本文や、横スクロールするカード列に使う。
 *
 * @summary 独自スタイルのスクロール領域
 */
const meta = {
	title: "shadcn-ui/ScrollArea",
	component: ScrollArea,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

const sections = [
	"火を起こす",
	"薪をくべる",
	"珈琲を淹れる",
	"本を読む",
	"夜風を浴びる",
	"星を眺める",
	"明日のことを少しだけ考える",
	"火を落とす",
	"片づける",
	"眠る",
];

/**
 * 縦にオーバーフローする本文をスクロール領域に収める形。
 * 高さを固定し、中身が溢れたときだけスクロールバーが現れる。
 * story では表示タイミングに依存しないよう `type="always"` で
 * スクロールバーを常時表示にしている (#65)。
 * @summary 縦に長い本文をスクロールする形
 */
export const Default: Story = {
	render: () => (
		<ScrollArea type="always" className="h-64 w-64 rounded-md border">
			<div className="p-4">
				<div className="mb-2 text-sm font-medium">夜の手順</div>
				{sections.map((section) => (
					<div key={section}>
						<div className="py-2 text-sm">{section}</div>
						<Separator />
					</div>
				))}
			</div>
		</ScrollArea>
	),
};

/**
 * 横にオーバーフローするカード列を、横スクロールで見せる形。
 * 明示的に `<ScrollBar orientation="horizontal" />` を入れる。
 * @summary 横スクロールで並ぶカード列
 */
export const Horizontal: Story = {
	render: () => (
		<ScrollArea
			type="always"
			className="w-[420px] rounded-md border whitespace-nowrap"
		>
			<div className="flex w-max gap-3 p-4">
				{Array.from({ length: 10 }).map((_, index) => (
					<div
						key={`tile-${index}`}
						className="flex h-32 w-40 shrink-0 items-end justify-start rounded-md border bg-card p-3 text-sm"
					>
						{index + 1} 番目の火床
					</div>
				))}
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	),
};
