import type { Meta, StoryObj } from "@storybook/react-vite";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

/**
 * 複数のトグルを横並びにしたグループ。Radix の `ToggleGroup` を Hidoko の
 * トークン上に載せた wrapper。`type="single"` で排他選択、`type="multiple"`
 * で多重選択。1 つだけ独立に切り替えるときは
 * [Toggle](?path=/docs/shadcn-ui-toggle--docs) を使う。
 *
 * @summary 複数トグルのグループ
 */
const meta: Meta<typeof ToggleGroup> = {
	title: "shadcn-ui/ToggleGroup",
	component: ToggleGroup,
	parameters: {
		layout: "centered",
	},
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

/**
 * `type="single"` の排他選択。テキスト整列のような「どれか 1 つ」の用途で使う。
 * @summary 排他選択（single）
 */
export const Single: Story = {
	render: () => (
		<ToggleGroup type="single" defaultValue="bold">
			<ToggleGroupItem value="bold" aria-label="太字">
				<BoldIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="italic" aria-label="斜体">
				<ItalicIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="underline" aria-label="下線">
				<UnderlineIcon />
			</ToggleGroupItem>
		</ToggleGroup>
	),
};

/**
 * `type="multiple"` の多重選択。装飾の重ねがけのような「いくつ選んでもよい」
 * 用途で使う。
 * @summary 多重選択（multiple）
 */
export const Multiple: Story = {
	render: () => (
		<ToggleGroup type="multiple" defaultValue={["bold", "underline"]}>
			<ToggleGroupItem value="bold" aria-label="太字">
				<BoldIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="italic" aria-label="斜体">
				<ItalicIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="underline" aria-label="下線">
				<UnderlineIcon />
			</ToggleGroupItem>
		</ToggleGroup>
	),
};

/**
 * 枠線つきの `outline` variant。本文と地続きでないツールバーで使う。
 * @summary outline variant
 */
export const Outline: Story = {
	render: () => (
		<ToggleGroup type="single" variant="outline" defaultValue="bold">
			<ToggleGroupItem value="bold" aria-label="太字">
				<BoldIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="italic" aria-label="斜体">
				<ItalicIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="underline" aria-label="下線">
				<UnderlineIcon />
			</ToggleGroupItem>
		</ToggleGroup>
	),
};
