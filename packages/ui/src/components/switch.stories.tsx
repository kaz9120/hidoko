import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "./label";
import { Switch } from "./switch";

/**
 * 即時に反映される 2 値トグル。Radix の `Switch` を Hidoko のトークン上に
 * 載せた wrapper。送信を待たずに設定が反映される場面で使う。フォーム送信
 * 経由の確定は [Checkbox](?path=/docs/shadcn-ui-checkbox--docs) を選ぶ。
 *
 * @summary 即時反映の 2 値トグル
 */
const meta = {
	title: "shadcn-ui/Switch",
	component: Switch,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 何も指定しない初期状態。オフで表示される。
 * @summary オフの初期状態
 */
export const Default: Story = {};

/**
 * `defaultChecked` を立てた状態。既存設定を差し戻す場面で使う。
 * @summary オン
 */
export const Checked: Story = {
	args: {
		defaultChecked: true,
	},
};

/**
 * 操作不能。権限不足や前段未確定など、切り替え自体を封じる場面で使う。
 * @summary 操作不能
 */
export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

/**
 * 一回り小さい `size="sm"`。密度の高いリスト行に並べるときに使う。
 * @summary 小さい size
 */
export const Small: Story = {
	args: {
		size: "sm",
	},
};

/**
 * ラベルと並べた基本形。ラベルのクリックでも切り替えが効くよう
 * `htmlFor` と `id` を合わせる。
 * @summary ラベル付きの基本形
 */
export const WithLabel: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Switch id="night-mode" />
			<Label htmlFor="night-mode">夜の配色にする</Label>
		</div>
	),
};
