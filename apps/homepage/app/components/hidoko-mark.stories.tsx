import type { Meta, StoryObj } from "@storybook/react-vite";

import { HidokoMark } from "./hidoko-mark";

/**
 * Hidoko の角丸ロゴマーク。`ui/assets/logo/mark-dark.svg` をそのまま `<img>`
 * で出すだけの薄いラッパで、`size` を px 単位で指定すると正方形で描画する。
 * 装飾扱いのため `aria-hidden` で alt は空にしている。
 *
 * @summary 角丸ロゴマーク
 */
const meta = {
	title: "homepage/HidokoMark",
	component: HidokoMark,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof HidokoMark>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定サイズ（22px）。footer など本文寄りの場所で使う想定。
 * @summary 既定サイズ
 */
export const Default: Story = {};

/**
 * TopNav で使うやや大きめのサイズ。
 * @summary ナビ用サイズ
 */
export const Nav: Story = {
	args: {
		size: 26,
	},
};

/**
 * Hero まわりで看板的に置く大きめのサイズ。
 * @summary 大きめサイズ
 */
export const Large: Story = {
	args: {
		size: 64,
	},
};
