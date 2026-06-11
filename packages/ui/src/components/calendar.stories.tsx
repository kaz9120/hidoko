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

// 実行日に依存すると VRT が日付のずれで毎回差分になるため、
// story 内の「今日」は固定する (#65)。
const FIXED_TODAY = new Date(2026, 5, 15);

/**
 * 単日を選ぶ最小構成。「今日」を選択した状態で開く
 * (VRT 安定化のため基準日は固定)。
 * @summary 単日選択
 */
export const Default: Story = {
	render: () => {
		const [date, setDate] = useState<Date | undefined>(FIXED_TODAY);
		return (
			<Calendar
				mode="single"
				selected={date}
				onSelect={setDate}
				today={FIXED_TODAY}
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
		const initial: DateRange = {
			from: FIXED_TODAY,
			to: new Date(
				FIXED_TODAY.getFullYear(),
				FIXED_TODAY.getMonth(),
				FIXED_TODAY.getDate() + 4,
			),
		};
		const [range, setRange] = useState<DateRange | undefined>(initial);
		return (
			<Calendar
				mode="range"
				selected={range}
				onSelect={setRange}
				today={FIXED_TODAY}
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
		const [date, setDate] = useState<Date | undefined>(FIXED_TODAY);
		return (
			<Calendar
				mode="single"
				selected={date}
				onSelect={setDate}
				disabled={{ before: FIXED_TODAY }}
				today={FIXED_TODAY}
				className="rounded-md border"
			/>
		);
	},
};
