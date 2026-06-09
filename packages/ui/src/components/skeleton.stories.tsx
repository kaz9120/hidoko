import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./skeleton";

/**
 * 読み込み中のプレースホルダ。`animate-pulse` で薄く点滅する。形は className
 * の `w-*` `h-*` で決め、これから読み込まれる本体と同じ寸法に近づける。
 *
 * @summary 読み込み中のプレースホルダ
 */
const meta = {
	title: "shadcn-ui/Skeleton",
	component: Skeleton,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 単純な 1 本のバー。本文 1 行ぶんの読み込み待ちなどに使う。
 * @summary 1 行ぶんの待ち
 */
export const Default: Story = {
	render: () => <Skeleton className="h-4 w-[240px]" />,
};

/**
 * カード状の組み合わせ。アバター丸 1 つと、本文 2 行を縦に並べる。note 一覧
 * の読み込み中など、複合的なレイアウトの待ちを表すときの基本形。
 * @summary カード形に組んだ待ち
 */
export const AsCard: Story = {
	render: () => (
		<div className="flex w-[280px] items-center gap-3">
			<Skeleton className="size-10 rounded-full" />
			<div className="flex flex-1 flex-col gap-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-3 w-2/3" />
			</div>
		</div>
	),
};
