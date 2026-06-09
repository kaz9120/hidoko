import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./checkbox";
import { Label } from "./label";

/**
 * オン / オフを切り替えるチェックボックス。Radix の `Checkbox` を Hidoko の
 * トークン上に載せた wrapper。複数項目を独立にオン / オフしたいときに使う。
 * 排他選択は [RadioGroup](?path=/docs/shadcn-ui-radiogroup--docs) を使う。
 *
 * @summary オン / オフを切り替えるチェックボックス
 */
const meta = {
	title: "shadcn-ui/Checkbox",
	component: Checkbox,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 何も指定しない初期状態。未チェックで表示される。
 * @summary 未チェックの初期状態
 */
export const Default: Story = {};

/**
 * `defaultChecked` を立てた状態。既存データを差し戻す場面で使う。
 * @summary チェック済み
 */
export const Checked: Story = {
	args: {
		defaultChecked: true,
	},
};

/**
 * 操作不能。フォーム送信中など、一時的に操作を封じる場面で使う。
 * @summary 操作不能
 */
export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

/**
 * バリデーション失敗時。`aria-invalid` を立てると枠とリングが destructive 寄り
 * になる。エラーメッセージは Field の下端に並べる。
 * @summary バリデーション失敗時
 */
export const Invalid: Story = {
	args: {
		"aria-invalid": true,
	},
};

/**
 * ラベルと組み合わせた基本形。ラベル側のクリックでも切り替えが効くよう
 * `htmlFor` と `id` を合わせる。
 * @summary ラベル付きの基本形
 */
export const WithLabel: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Checkbox id="newsletter" />
			<Label htmlFor="newsletter">焚き火便りを受け取る</Label>
		</div>
	),
};
