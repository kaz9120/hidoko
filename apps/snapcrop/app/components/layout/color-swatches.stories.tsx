import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TooltipProvider } from "ui/components/tooltip";

import { PRESET_COLORS } from "~/lib/rect-engine";

import { ColorSwatches } from "./color-swatches";

/**
 * 注釈ツール共通のプリセット 6 色スウォッチ + カスタム色 (近日対応) ボタン。
 * 矢印ツールバー (および今後のテキスト / マーカーツールバー) が共用する。
 * 選択中の色は foreground の輪郭で示し、カスタム色は aria-disabled の
 * Tooltip 付きプレースホルダ。
 *
 * @summary 注釈ツール共通の色スウォッチ
 */
const meta = {
	title: "snapcrop/Layout/ColorSwatches",
	component: ColorSwatches,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<TooltipProvider>
				<div className="flex h-[38px] items-center rounded-md border border-border bg-[var(--bg-overlay)] px-3.5">
					<Story />
				</div>
			</TooltipProvider>
		),
	],
} satisfies Meta<typeof ColorSwatches>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * デフォルトの選択状態 (プリセット 1 色目の赤)。クリックで色を切り替える
 * controlled component なので、story では useState で挙動を再現する。
 * @summary 選択あり (操作可)
 */
export const Default: Story = {
	args: {
		value: PRESET_COLORS[0],
		onChange: () => {},
	},
	render: function Render(args) {
		const [value, setValue] = useState<string>(args.value);
		return <ColorSwatches onChange={setValue} value={value} />;
	},
};

/**
 * disabled 状態。矩形ツールの mosaic スタイルのように「色が意味を持たない」
 * 設定のときに、薄く表示しつつクリックを無効化する。
 * @summary 無効状態
 */
export const Disabled: Story = {
	args: {
		value: PRESET_COLORS[1],
		onChange: () => {},
		disabled: true,
	},
};
