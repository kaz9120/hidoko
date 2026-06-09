import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./input";

/**
 * 1 行のテキスト入力。HTML `<input>` を Hidoko のトークン上に載せた
 * 薄ラップで、`type` を切り替えると email / password / number / file 等の
 * 標準入力種別をそのまま受け継ぐ。ラベル・補助テキストと一緒に使うときは
 * [Field](?path=/docs/shadcn-ui-field--docs) でグルーピングする。
 *
 * @summary 1 行テキスト入力
 */
const meta = {
	title: "shadcn-ui/Input",
	component: Input,
	args: {
		placeholder: "例: 三軒茶屋",
	},
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 何も入っていない初期状態。placeholder だけ表示される。
 * @summary 空の入力欄
 */
export const Default: Story = {};

/**
 * 値が入っている状態。ユーザーが編集中、もしくは既存データを差し戻している。
 * @summary 値が入った状態
 */
export const WithValue: Story = {
	args: {
		defaultValue: "焚き火",
	},
};

/**
 * 入力不能状態。フォームの送信中など、ユーザー操作を一時的に封じる場面で使う。
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
 * `--destructive` 寄りになる。エラーメッセージは Field の下端に並べる。
 * @summary バリデーション失敗時
 */
export const Invalid: Story = {
	args: {
		defaultValue: "不正",
		"aria-invalid": true,
	},
};

/**
 * モバイル端末で email キーボードを出すための `type="email"`。
 * @summary email 入力
 */
export const Email: Story = {
	args: {
		type: "email",
		placeholder: "name@example.com",
	},
};

/**
 * ネイティブのファイル選択ボタン。暗背景でも file part の枠が破綻しないことを
 * 確認するための story。
 * @summary ファイル選択
 */
export const File: Story = {
	args: {
		type: "file",
	},
};
