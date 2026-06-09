import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./textarea";

/**
 * 複数行のテキスト入力。HTML `<textarea>` を Hidoko のトークン上に載せた
 * 薄ラップで、`field-sizing-content` により入力量に応じて自然に縦伸びする。
 * 長文のメモ、自由記述の感想、コミットメッセージのような用途で使う。
 *
 * @summary 複数行テキスト入力
 */
const meta = {
	title: "shadcn-ui/Textarea",
	component: Textarea,
	args: {
		placeholder: "今夜の焚き火で考えたことを書く",
	},
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 何も入っていない初期状態。placeholder だけ表示される。
 * @summary 空のテキストエリア
 */
export const Default: Story = {};

/**
 * 値が入っている状態。既存データの編集や、長文の途中をプレビューする場面。
 * @summary 値が入った状態
 */
export const WithValue: Story = {
	args: {
		defaultValue:
			"三軒茶屋の路地裏、火床の上で薪がはぜる音を聞きながら、次のリリースの段取りを考えていた。",
	},
};

/**
 * 入力不能状態。下書きを参照表示するだけで編集させたくない場面で使う。
 * @summary 入力不能
 */
export const Disabled: Story = {
	args: {
		defaultValue: "編集できません",
		disabled: true,
	},
};

/**
 * バリデーションエラー時。`aria-invalid` を true にすると枠とリングが
 * `--destructive` 寄りになる。
 * @summary バリデーション失敗時
 */
export const Invalid: Story = {
	args: {
		defaultValue: "短すぎる",
		"aria-invalid": true,
	},
};

/**
 * 既定の最大行数を超える長文。`field-sizing-content` により高さが追従する。
 * @summary 長文での縦伸び
 */
export const LongContent: Story = {
	args: {
		defaultValue: Array.from({ length: 8 })
			.map(
				(_, i) =>
					`${i + 1} 行目。火床の縁に腰を下ろし、長く伸びる影を眺めながら、次に焚べる薪の太さを選ぶ。`,
			)
			.join("\n"),
	},
};
