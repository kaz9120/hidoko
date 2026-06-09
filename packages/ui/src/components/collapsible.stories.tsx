import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "./button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./collapsible";

/**
 * 折りたたみ可能な 1 つのブロック。Accordion と違って item の概念は無く、
 * 「ここを開閉する」だけの最小単位を提供する。「もっと見る」「詳細」
 * のような、開閉を 1 箇所で完結させたい場面で使う。
 *
 * @summary 1 ブロックの折りたたみ
 */
const meta = {
	title: "shadcn-ui/Collapsible",
	component: Collapsible,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Trigger とその下の content を持つ基本形。controlled に open を持ち、
 * トリガに開閉アイコンを添える。
 * @summary トリガと content を持つ基本形
 */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(true);
		return (
			<Collapsible
				open={open}
				onOpenChange={setOpen}
				className="w-[320px] space-y-2"
			>
				<div className="flex items-center justify-between gap-2">
					<div className="text-sm font-medium">三軒茶屋の夜の道具</div>
					<CollapsibleTrigger asChild>
						<Button size="xs" variant="ghost" aria-label="開閉">
							<ChevronsUpDownIcon />
						</Button>
					</CollapsibleTrigger>
				</div>
				<div className="rounded-md border px-3 py-2 text-sm">火ばさみ</div>
				<CollapsibleContent className="space-y-2">
					<div className="rounded-md border px-3 py-2 text-sm">グローブ</div>
					<div className="rounded-md border px-3 py-2 text-sm">火吹き棒</div>
				</CollapsibleContent>
			</Collapsible>
		);
	},
};
