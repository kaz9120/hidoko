import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlameIcon } from "lucide-react";

import { Button } from "./button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./empty";

/**
 * リストや検索結果が 0 件のときに置く、空状態のプレースホルダ。`EmptyHeader`
 * (icon + title + description) の上下に `EmptyContent` で行動導線を置く構成
 * を基本にする。
 *
 * @summary 0 件状態のプレースホルダ
 */
const meta = {
	title: "shadcn-ui/Empty",
	component: Empty,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Empty>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 標準の組み合わせ。icon ありの `EmptyMedia` + `EmptyTitle` +
 * `EmptyDescription` を `EmptyHeader` でまとめ、下に次の一手のボタンを置く。
 * @summary 標準構成の空状態
 */
export const Default: Story = {
	render: () => (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<FlameIcon />
				</EmptyMedia>
				<EmptyTitle>まだ予定がありません</EmptyTitle>
				<EmptyDescription>
					ふたりの最初の予定を作って、火床に光を灯しましょう。
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button>予定を作る</Button>
			</EmptyContent>
		</Empty>
	),
};

/**
 * Media を省いて、Title と Description だけを置いた最小構成。検索結果 0 件
 * など、文章だけで意味が伝わる場面で使う。
 * @summary 文章だけで伝える空状態
 */
export const TextOnly: Story = {
	render: () => (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>該当する note が見つかりません</EmptyTitle>
				<EmptyDescription>
					検索語を短くするか、別のキーワードでもう一度試してみてください。
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
};
