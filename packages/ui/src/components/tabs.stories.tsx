import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

/**
 * 横並びまたは縦並びのタブ。同じ高さの中で文脈を切り替えるときに使う。
 * 既定の `variant="default"` は背景のあるピル型、`variant="line"` は
 * 下線型のシンプルなタブになる。
 *
 * @summary 文脈切り替えのタブ
 */
const meta = {
	title: "shadcn-ui/Tabs",
	component: Tabs,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 3 タブの基本形。各タブの content は同じ高さに収まる前提で組む。
 * @summary 3 タブの基本形
 */
export const Default: Story = {
	render: () => (
		<Tabs defaultValue="fire" className="w-[420px]">
			<TabsList>
				<TabsTrigger value="fire">火</TabsTrigger>
				<TabsTrigger value="coffee">珈琲</TabsTrigger>
				<TabsTrigger value="book">本</TabsTrigger>
			</TabsList>
			<TabsContent value="fire" className="rounded-md border p-4 text-sm">
				乾いた焚き付けから始め、細い枝、太い薪へと足していく。
			</TabsContent>
			<TabsContent value="coffee" className="rounded-md border p-4 text-sm">
				火床の脇で挽きたてを 1 杯。お湯はゆっくり注ぐ。
			</TabsContent>
			<TabsContent value="book" className="rounded-md border p-4 text-sm">
				夜風と火明かりで読む 1 冊。栞は手元に。
			</TabsContent>
		</Tabs>
	),
};

/**
 * `variant="line"` の下線型タブ。背景を持たないので、本編にとけ込む。
 * 章立てのような、同列に並ぶ大きなセクションに向く。
 * @summary 下線型のタブ
 */
export const Line: Story = {
	render: () => (
		<Tabs defaultValue="tonight" className="w-[420px]">
			<TabsList variant="line">
				<TabsTrigger value="tonight">今夜</TabsTrigger>
				<TabsTrigger value="weekend">週末</TabsTrigger>
				<TabsTrigger value="someday">いつか</TabsTrigger>
			</TabsList>
			<TabsContent value="tonight" className="rounded-md border p-4 text-sm">
				火床に火を入れて、珈琲を淹れる。
			</TabsContent>
			<TabsContent value="weekend" className="rounded-md border p-4 text-sm">
				ふたりで三軒茶屋まで歩いてゆく。
			</TabsContent>
			<TabsContent value="someday" className="rounded-md border p-4 text-sm">
				山小屋を借りて、何日か火を眺めるだけの時間を持つ。
			</TabsContent>
		</Tabs>
	),
};
