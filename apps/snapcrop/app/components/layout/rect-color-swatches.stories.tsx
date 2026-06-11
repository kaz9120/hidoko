import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { RectColorSwatches } from "./rect-color-swatches";

/**
 * 矩形ツールバーの色選択行。プリセット 6 色の円形スウォッチと、任意色を
 * 選べるカスタムスウォッチ (`+`) を並べる。`+` をクリックすると Popover が
 * 開き、ネイティブのカラーピッカーと hex 入力で色を決められる。
 *
 * 現在色がプリセット外のときは `+` スウォッチがその色で塗られ、プリセットと
 * 同じ選択リングが付く。hex 入力は `#` の有無を問わず 3 桁 / 6 桁を受け付け、
 * 不正値は現在色へ巻き戻す。
 *
 * @summary 矩形の色スウォッチ + カスタムカラーピッカー
 */
const meta = {
	title: "snapcrop/Layout/RectColorSwatches",
	component: RectColorSwatches,
	decorators: [
		(Story) => (
			<div className="flex h-[38px] items-center bg-[var(--bg-overlay)] px-3.5">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof RectColorSwatches>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * プリセット色 (赤) を選択中の状態。`+` スウォッチは虹色グラデーションで、
 * クリックするとカスタムカラーピッカーの Popover が開く。
 * @summary プリセット色を選択中
 */
export const Default: Story = {
	args: {
		value: "#ef4444",
		disabled: false,
		onChange: () => {},
	},
	render: (args) => {
		const [value, setValue] = useState(args.value);
		return (
			<RectColorSwatches
				disabled={args.disabled}
				onChange={setValue}
				value={value}
			/>
		);
	},
};

/**
 * プリセット外のカスタム色を選択中の状態。`+` スウォッチが現在色で塗られ、
 * プリセットと同じ選択リングが付く。明るい色のときは Plus アイコンが黒に、
 * 暗い色のときは白に切り替わる。
 * @summary カスタム色を選択中
 */
export const CustomSelected: Story = {
	args: {
		value: "#9b5de5",
		disabled: false,
		onChange: () => {},
	},
	render: (args) => {
		const [value, setValue] = useState(args.value);
		return (
			<RectColorSwatches
				disabled={args.disabled}
				onChange={setValue}
				value={value}
			/>
		);
	},
};

/**
 * モザイクスタイル選択中など、色が無効な状態。行全体が減光され、
 * プリセットもカスタムスウォッチもクリックできない。
 * @summary 無効状態 (モザイク選択中)
 */
export const Disabled: Story = {
	args: {
		value: "#ef4444",
		disabled: true,
		onChange: () => {},
	},
};
