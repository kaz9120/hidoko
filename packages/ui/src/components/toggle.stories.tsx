import type { Meta, StoryObj } from "@storybook/react-vite";
import { BoldIcon } from "lucide-react";

import { Toggle } from "./toggle";

/**
 * 単独の押下状態を持つトグルボタン。Radix の `Toggle` を Hidoko のトークン
 * 上に載せた wrapper。`on` / `off` を独立に切り替えたいアイコンボタンで使う。
 * 複数のトグルをまとめて排他 / 多重選択するときは
 * [ToggleGroup](?path=/docs/shadcn-ui-togglegroup--docs) を使う。
 *
 * @summary 単独のオン / オフトグル
 */
const meta = {
	title: "shadcn-ui/Toggle",
	component: Toggle,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * アイコン 1 つの基本形。ツールバーの太字ボタン等で使う。
 * @summary アイコン 1 つの基本形
 */
export const Default: Story = {
	render: () => (
		<Toggle aria-label="太字">
			<BoldIcon />
		</Toggle>
	),
};

/**
 * 枠線つきの `outline` variant。ツールバーから少し独立して見せたいときに使う。
 * @summary outline variant
 */
export const Outline: Story = {
	render: () => (
		<Toggle variant="outline" aria-label="太字">
			<BoldIcon />
		</Toggle>
	),
};

/**
 * `defaultPressed` を立てた状態。既存設定を差し戻す場面で使う。
 * @summary オン状態
 */
export const Pressed: Story = {
	render: () => (
		<Toggle defaultPressed aria-label="太字">
			<BoldIcon />
		</Toggle>
	),
};

/**
 * 操作不能。権限不足や前段未確定など、切り替え自体を封じる場面で使う。
 * @summary 操作不能
 */
export const Disabled: Story = {
	render: () => (
		<Toggle disabled aria-label="太字">
			<BoldIcon />
		</Toggle>
	),
};

/**
 * アイコンの右にラベルを並べた基本形。ツールバーが広く取れるときに使う。
 * @summary アイコン + ラベル
 */
export const WithText: Story = {
	render: () => (
		<Toggle aria-label="太字">
			<BoldIcon />
			太字
		</Toggle>
	),
};
