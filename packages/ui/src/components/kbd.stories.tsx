import type { Meta, StoryObj } from "@storybook/react-vite";

import { Kbd, KbdGroup } from "./kbd";

/**
 * キーボードショートカット表記。本文や Tooltip / Menu の末尾に置いて、
 * 同じ操作にキーボードからも到達できることを伝える。`KbdGroup` で複数キーを
 * 連ねる。
 *
 * @summary キーボードショートカット表記
 */
const meta = {
	title: "shadcn-ui/Kbd",
	component: Kbd,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Kbd>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 単独キー。`Esc` や `Enter` のような単発のショートカットに使う。
 * @summary 単独キー
 */
export const Default: Story = {
	args: {
		children: "Esc",
	},
};

/**
 * Command と他キーの組み合わせ。`KbdGroup` で隣接させると、間隔と整列が揃う。
 * @summary 複数キーの組み合わせ
 */
export const WithSequence: Story = {
	render: () => (
		<KbdGroup>
			<Kbd>⌘</Kbd>
			<Kbd>K</Kbd>
		</KbdGroup>
	),
};

/**
 * メニュー項目の右端に並べたい用途を想定したサンプル。本文と一緒に並べた
 * ときの行の高さと余白を確認する。
 * @summary 本文の末尾に添える
 */
export const InlineWithText: Story = {
	render: () => (
		<p className="text-sm text-text-muted">
			コマンドパレットを開く{" "}
			<KbdGroup>
				<Kbd>⌘</Kbd>
				<Kbd>K</Kbd>
			</KbdGroup>
		</p>
	),
};
