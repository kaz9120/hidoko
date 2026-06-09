import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "./carousel";

/**
 * 横スクロール式のスライダー。`embla-carousel-react` を Hidoko トークンに載せた wrapper。
 * 矢印キー操作 (`←` / `→`) も組み込み済み。orientation で縦スクロールにも切り替えられる。
 *
 * @summary 横スクロール式スライダー
 */
const meta = {
	title: "shadcn-ui/Carousel",
	component: Carousel,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Carousel>;

export default meta;

type Story = StoryObj<typeof meta>;

const slides = ["三軒茶屋", "下北沢", "渋谷", "二子玉川", "代々木公園"];

/**
 * 5 つのカードを横スクロールで見せる。矢印ボタンで 1 枚ずつ進める。
 * @summary 標準の横スクロール
 */
export const Default: Story = {
	render: () => (
		<Carousel className="w-full max-w-sm">
			<CarouselContent>
				{slides.map((label) => (
					<CarouselItem key={label}>
						<div className="flex aspect-square items-center justify-center rounded-md border bg-muted text-2xl font-semibold">
							{label}
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	),
};

/**
 * 1 画面に複数枚を見せる例。`basis-*` で各 item の幅を分数指定する。
 * @summary 1 画面複数枚
 */
export const MultipleItems: Story = {
	render: () => (
		<Carousel className="w-full max-w-xl" opts={{ align: "start" }}>
			<CarouselContent>
				{slides.map((label) => (
					<CarouselItem key={label} className="md:basis-1/2 lg:basis-1/3">
						<div className="flex aspect-square items-center justify-center rounded-md border bg-muted text-xl font-semibold">
							{label}
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	),
};

/**
 * 縦方向にスクロールする例。高さを固定し、上下キーで送る用途で使う。
 * @summary 縦スクロール
 */
export const Vertical: Story = {
	render: () => (
		<Carousel
			orientation="vertical"
			className="w-full max-w-xs"
			opts={{ align: "start" }}
		>
			<CarouselContent className="h-[240px]">
				{slides.map((label) => (
					<CarouselItem key={label} className="basis-1/2">
						<div className="flex h-full items-center justify-center rounded-md border bg-muted text-lg font-semibold">
							{label}
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	),
};
