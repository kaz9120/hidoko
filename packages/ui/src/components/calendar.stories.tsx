import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "./calendar";

/**
 * 月単位の日付ピッカー。`react-day-picker` v9 を Hidoko トークンに載せた wrapper。
 * 単日選択 (`mode="single"`)、範囲選択 (`mode="range"`)、複数選択 (`mode="multiple"`)
 * のいずれかを `mode` で切り替える。
 *
 * @summary 月カレンダー
 */
const meta = {
	title: "shadcn-ui/Calendar",
	component: Calendar,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 単日を選ぶ最小構成。今日の日付を default にして開く。
 * @summary 単日選択
 */
export const Default: Story = {
	render: () => {
		const [date, setDate] = useState<Date | undefined>(new Date());
		return (
			<Calendar
				mode="single"
				selected={date}
				onSelect={setDate}
				className="rounded-md border"
			/>
		);
	},
};

/**
 * 範囲選択。「焚き火に行く期間」のように from / to を持つ予定の入力に使う。
 * @summary 範囲選択
 */
export const RangeSelection: Story = {
	render: () => {
		const today = new Date();
		const initial: DateRange = {
			from: today,
			to: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
		};
		const [range, setRange] = useState<DateRange | undefined>(initial);
		return (
			<Calendar
				mode="range"
				selected={range}
				onSelect={setRange}
				numberOfMonths={2}
				className="rounded-md border"
			/>
		);
	},
};

/**
 * 過去の日付を無効化する例。`disabled` に判定関数を渡すと、その日が押せなくなる。
 * @summary 過去日を無効化
 */
export const DisabledPast: Story = {
	render: () => {
		const today = new Date();
		const [date, setDate] = useState<Date | undefined>(today);
		return (
			<Calendar
				mode="single"
				selected={date}
				onSelect={setDate}
				disabled={{ before: today }}
				className="rounded-md border"
			/>
		);
	},
};
