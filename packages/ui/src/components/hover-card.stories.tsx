import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "./avatar";
import { Button } from "./button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

/**
 * トリガにポインタを乗せると出るリッチなカード。Radix の `HoverCard` を
 * Hidoko のトークン上に載せた wrapper。プロフィールやリンクの preview
 * など、補助情報を hover で見せる用途に向く。タッチ端末では発火しないので、
 * クリック起点で見せたいものは [Popover](?path=/docs/shadcn-ui-popover--docs)
 * を使う。
 *
 * @summary hover で出るリッチカード
 */
const meta = {
	title: "shadcn-ui/HoverCard",
	component: HoverCard,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof HoverCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * リンクテキストに hover すると、リンク先の人物プロフィールが立ち上がる
 * プロフィールカード風の用例。
 * @summary プロフィールカード
 */
export const Default: Story = {
	render: () => (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Button variant="link">@kyamamoto</Button>
			</HoverCardTrigger>
			<HoverCardContent>
				<div className="flex gap-3">
					<Avatar>
						<AvatarFallback>ky</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-1">
						<div className="text-sm font-semibold">kyamamoto</div>
						<p className="text-xs text-muted-foreground">
							焚き火を愛するエンジニア。Hidoko で個人開発の火床を組んでいる。
						</p>
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<CalendarIcon className="size-3" />
							三軒茶屋から、2024 年から
						</div>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	),
};

/**
 * トリガをテキストに直接刺した形。文章中の固有名詞に注釈を付ける用途に
 * 向く。
 * @summary インラインの注釈
 */
export const Inline: Story = {
	render: () => (
		<p className="max-w-sm text-sm">
			今夜は{" "}
			<HoverCard>
				<HoverCardTrigger className="underline decoration-dotted underline-offset-4">
					火床
				</HoverCardTrigger>
				<HoverCardContent className="w-56">
					<div className="text-sm font-medium">火床（ひどこ）</div>
					<p className="mt-1 text-xs text-muted-foreground">
						焚き火の薪を載せる場所。Hidoko の名前の由来。
					</p>
				</HoverCardContent>
			</HoverCard>{" "}
			の組み直しをしている。
		</p>
	),
};

/**
 * `openDelay` を伸ばして、意図しない hover での発火を抑える。長文の中の
 * 注釈や、密集したリンク群で使う。
 * @summary 長めの遅延で慎重に出す
 */
export const SlowOpen: Story = {
	render: () => (
		<HoverCard openDelay={600} closeDelay={120}>
			<HoverCardTrigger asChild>
				<Button variant="outline">ゆっくり開く</Button>
			</HoverCardTrigger>
			<HoverCardContent>
				<p className="text-xs text-muted-foreground">
					600ms 待ってから出る。長文のなかでも邪魔をしない。
				</p>
			</HoverCardContent>
		</HoverCard>
	),
};
