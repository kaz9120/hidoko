import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./accordion";

/**
 * 折りたためる縦並びのリスト。FAQ や、ステップごとの詳細補足、
 * 「読み込みたければ開く」型のセクションに向く。`type="single"` で
 * 同時に 1 つだけ開かせるか、`type="multiple"` で複数を同時に開かせるかを選ぶ。
 *
 * @summary 折りたためる縦並びリスト
 */
const meta: Meta<typeof Accordion> = {
	title: "shadcn-ui/Accordion",
	component: Accordion,
	parameters: {
		layout: "padded",
	},
};

export default meta;

type Story = StoryObj<typeof Accordion>;

/**
 * `type="single"` `collapsible` の基本形。同時に 1 つだけ開き、
 * 開いている item をもう一度クリックすると閉じられる。
 * @summary 1 つだけ開く折りたたみ
 */
export const Default: Story = {
	render: () => (
		<Accordion
			type="single"
			collapsible
			defaultValue="item-1"
			className="w-[360px]"
		>
			<AccordionItem value="item-1">
				<AccordionTrigger>火を起こすには？</AccordionTrigger>
				<AccordionContent>
					乾いた焚き付けを中心に、細い枝から太い薪へ。風の通り道を残す。
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>薪はどこで買う？</AccordionTrigger>
				<AccordionContent>
					三軒茶屋の道具屋か、隣町のホームセンター。広葉樹を選ぶ。
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>消火はどうする？</AccordionTrigger>
				<AccordionContent>
					水をかけるのではなく、灰をかぶせてゆっくり鎮める。翌朝もう一度確認する。
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};

/**
 * `type="multiple"` で複数 item を同時に開ける形。比較しながら読みたい、
 * 一覧で展開しておきたい、といった用途に使う。
 * @summary 複数同時に開ける折りたたみ
 */
export const Multiple: Story = {
	render: () => (
		<Accordion
			type="multiple"
			defaultValue={["item-1", "item-2"]}
			className="w-[360px]"
		>
			<AccordionItem value="item-1">
				<AccordionTrigger>道具のリスト</AccordionTrigger>
				<AccordionContent>火ばさみ、グローブ、火吹き棒。</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>食べるもの</AccordionTrigger>
				<AccordionContent>パン、チーズ、林檎。</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>飲むもの</AccordionTrigger>
				<AccordionContent>珈琲、白湯、少しのウィスキー。</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};
