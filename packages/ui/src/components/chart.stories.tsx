import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "./chart";

/**
 * recharts の薄い wrapper。`ChartContainer` に config を渡すと、CSS 変数として
 * 色トークンが流し込まれ、tooltip / legend の見た目が Hidoko 仕様で揃う。
 * 中身の chart 種別 (Bar / Line / Area / Pie 等) は recharts のものをそのまま使う。
 *
 * @summary recharts wrapper
 */
const meta: Meta<typeof ChartContainer> = {
	title: "shadcn-ui/Chart",
	component: ChartContainer,
	parameters: {
		layout: "padded",
	},
};

export default meta;

type Story = StoryObj<typeof ChartContainer>;

const weekday = [
	{ day: "月", count: 2 },
	{ day: "火", count: 4 },
	{ day: "水", count: 3 },
	{ day: "木", count: 5 },
	{ day: "金", count: 6 },
	{ day: "土", count: 8 },
	{ day: "日", count: 7 },
];

const weekdayConfig = {
	count: {
		label: "予定数",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

/**
 * 各曜日の予定数を棒で見せる例。tooltip に `ChartTooltipContent` を挿し、
 * config の label が表示されることを確認する。
 * @summary 棒グラフ
 */
export const Default: Story = {
	render: () => (
		<ChartContainer config={weekdayConfig} className="h-[240px] w-full max-w-xl">
			<BarChart data={weekday}>
				<CartesianGrid vertical={false} />
				<XAxis dataKey="day" tickLine={false} axisLine={false} />
				<ChartTooltip content={<ChartTooltipContent />} />
				<Bar dataKey="count" fill="var(--color-count)" radius={4} />
			</BarChart>
		</ChartContainer>
	),
};

const monthly = [
	{ month: "1 月", snapcrop: 12, futari: 4 },
	{ month: "2 月", snapcrop: 18, futari: 6 },
	{ month: "3 月", snapcrop: 22, futari: 9 },
	{ month: "4 月", snapcrop: 30, futari: 11 },
	{ month: "5 月", snapcrop: 28, futari: 14 },
	{ month: "6 月", snapcrop: 34, futari: 16 },
];

const monthlyConfig = {
	snapcrop: {
		label: "snapcrop",
		color: "var(--chart-1)",
	},
	futari: {
		label: "ふたりのよてい",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

/**
 * 2 系列の折れ線。legend を出して、どの色がどの系列かを示す。
 * 利用回数の推移をアプリ別に並べたサンプル。
 * @summary 折れ線グラフ + 凡例
 */
export const MultiSeriesLine: Story = {
	render: () => (
		<ChartContainer config={monthlyConfig} className="h-[260px] w-full max-w-xl">
			<LineChart data={monthly}>
				<CartesianGrid vertical={false} />
				<XAxis dataKey="month" tickLine={false} axisLine={false} />
				<ChartTooltip content={<ChartTooltipContent />} />
				<ChartLegend content={<ChartLegendContent />} />
				<Line
					dataKey="snapcrop"
					stroke="var(--color-snapcrop)"
					strokeWidth={2}
					dot={false}
				/>
				<Line
					dataKey="futari"
					stroke="var(--color-futari)"
					strokeWidth={2}
					dot={false}
				/>
			</LineChart>
		</ChartContainer>
	),
};
