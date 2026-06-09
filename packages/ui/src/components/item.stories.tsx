import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronRightIcon, FlameIcon, MapPinIcon } from "lucide-react";

import { Button } from "./button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemSeparator,
	ItemTitle,
} from "./item";

/**
 * リスト・カードに共通する「行」の primitive。`ItemMedia` (左の icon / image)、
 * `ItemContent` (タイトル + 説明)、`ItemActions` (右側の操作) の 3 領域で組む。
 * `ItemGroup` でラップし、間に `ItemSeparator` を挟むと一覧になる。
 *
 * @summary リストの 1 行 primitive
 */
const meta = {
	title: "shadcn-ui/Item",
	component: Item,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Item>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 単独の Item。左に icon、中央にタイトル + 補足、右にアクション。
 * @summary 単独の行
 */
export const Default: Story = {
	render: () => (
		<Item variant="outline" className="w-[420px]">
			<ItemMedia variant="icon">
				<FlameIcon />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>火床の夜</ItemTitle>
				<ItemDescription>
					三軒茶屋の路地裏で焚き火を囲む読書会。
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button size="sm" variant="ghost">
					<ChevronRightIcon />
				</Button>
			</ItemActions>
		</Item>
	),
};

/**
 * 複数の Item を `ItemGroup` でまとめ、`ItemSeparator` で区切る。
 * 設定画面や一覧画面の中身に使う。
 * @summary グループ化したリスト
 */
export const Group: Story = {
	render: () => (
		<ItemGroup className="w-[420px] rounded-md border">
			<Item>
				<ItemMedia variant="icon">
					<FlameIcon />
				</ItemMedia>
				<ItemContent>
					<ItemTitle>火床の夜</ItemTitle>
					<ItemDescription>三軒茶屋・木曜の夜</ItemDescription>
				</ItemContent>
				<ItemActions>
					<ChevronRightIcon className="size-4 text-muted-foreground" />
				</ItemActions>
			</Item>
			<ItemSeparator />
			<Item>
				<ItemMedia variant="icon">
					<MapPinIcon />
				</ItemMedia>
				<ItemContent>
					<ItemTitle>夜の散歩</ItemTitle>
					<ItemDescription>下北沢 → 三軒茶屋</ItemDescription>
				</ItemContent>
				<ItemActions>
					<ChevronRightIcon className="size-4 text-muted-foreground" />
				</ItemActions>
			</Item>
			<ItemSeparator />
			<Item>
				<ItemMedia variant="icon">
					<FlameIcon />
				</ItemMedia>
				<ItemContent>
					<ItemTitle>焚き付け仕込み</ItemTitle>
					<ItemDescription>土曜の昼に新聞紙を集める</ItemDescription>
				</ItemContent>
				<ItemActions>
					<ChevronRightIcon className="size-4 text-muted-foreground" />
				</ItemActions>
			</Item>
		</ItemGroup>
	),
};

/**
 * 控えめな背景の `muted` variant と、コンパクトな `sm` size を組み合わせた例。
 * 1 行に詰めて並べたいときに使う。
 * @summary muted + sm
 */
export const Compact: Story = {
	render: () => (
		<Item variant="muted" size="sm" className="w-[360px]">
			<ItemMedia variant="icon">
				<MapPinIcon />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>三軒茶屋</ItemTitle>
			</ItemContent>
			<ItemActions>
				<Button size="xs" variant="ghost">
					変更
				</Button>
			</ItemActions>
		</Item>
	),
};
