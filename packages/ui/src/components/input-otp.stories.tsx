import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "./input-otp";

/**
 * ワンタイムパスワード入力。`input-otp` を Hidoko のトークン上に載せた
 * 薄ラップで、`maxLength` に応じた数のスロットを並べて 1 文字ずつ入力する。
 * 2 段階認証のコード入力やメール認証で使う。
 *
 * @summary OTP（ワンタイムパスワード）入力
 */
const meta = {
	title: "shadcn-ui/InputOTP",
	component: InputOTP,
	parameters: {
		layout: "centered",
	},
	args: {
		maxLength: 6,
		children: null,
	},
} satisfies Meta<typeof InputOTP>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 6 桁のスロットを 1 列に並べた基本形。
 * @summary 6 桁の OTP
 */
export const Default: Story = {
	render: () => (
		<InputOTP maxLength={6}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	),
};

/**
 * 3 桁ずつをセパレータで区切った例。クレジットカードのセキュリティコードや
 * 電話認証コードのように「視認のリズム」を入れたいときに使う。
 * @summary セパレータで区切った 3-3 構成
 */
export const WithSeparator: Story = {
	render: () => (
		<InputOTP maxLength={6}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	),
};

/**
 * 既に値が入っている状態。`defaultValue` で初期値を渡せる。
 * @summary 値が入った状態
 */
export const WithValue: Story = {
	render: () => (
		<InputOTP maxLength={6} defaultValue="123456">
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	),
};

/**
 * 入力不能状態。送信処理中など、ユーザー操作を一時的に封じる場面で使う。
 * @summary 入力不能
 */
export const Disabled: Story = {
	render: () => (
		<InputOTP maxLength={6} disabled defaultValue="000">
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	),
};
