import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Label } from "./label";
import { Slider } from "./slider";

/**
 * つまみを動かして数値を選ぶスライダー。Radix の `Slider` を Hidoko の
 * トークン上に載せた wrapper。`defaultValue` を配列で渡し、要素数で
 * single / range を切り替える。厳密な数値入力は Input[type=number] を使う。
 *
 * @summary 数値を選ぶスライダー
 */
const meta = {
	title: "shadcn-ui/Slider",
	component: Slider,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * つまみ 1 つで 0 - 100 の値を選ぶ基本形。
 * @summary 単一値の基本形
 */
export const Default: Story = {
	render: () => (
		<div className="w-72">
			<Slider defaultValue={[42]} max={100} step={1} />
		</div>
	),
};

/**
 * つまみ 2 つで下限 / 上限を選ぶ range 形式。defaultValue を 2 要素配列
 * にすると range として描画される。
 * @summary range（2 つの handle）
 */
export const Range: Story = {
	render: () => (
		<div className="w-72">
			<Slider defaultValue={[20, 80]} max={100} step={1} />
		</div>
	),
};

/**
 * 操作不能。前段の選択に依存して、まだ値を変えられない場面で使う。
 * @summary 操作不能
 */
export const Disabled: Story = {
	render: () => (
		<div className="w-72">
			<Slider defaultValue={[50]} max={100} step={1} disabled />
		</div>
	),
};

/**
 * 値を外から controlled する例。現在値の表示や、他の入力と連動させたい
 * ときに使う。
 * @summary controlled で値を表示
 */
export const Controlled: Story = {
	render: () => {
		const [value, setValue] = useState([60]);
		return (
			<div className="flex w-72 flex-col gap-3">
				<div className="flex items-center justify-between">
					<Label htmlFor="ember">火力</Label>
					<span className="text-sm text-muted-foreground">{value[0]}</span>
				</div>
				<Slider
					id="ember"
					value={value}
					onValueChange={setValue}
					max={100}
					step={1}
				/>
			</div>
		);
	},
};
