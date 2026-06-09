import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./input";
import { Label } from "./label";

/**
 * フォームコントロールに紐づくラベル。Radix の `Label` を Hidoko のトークン
 * 上に載せた薄ラップで、`htmlFor` を入力要素の `id` に揃えて使う。単体で
 * 並べることは少なく、Input / Textarea / Select 等と組み合わせて使う。
 *
 * @summary フォーム用ラベル
 */
const meta = {
	title: "shadcn-ui/Label",
	component: Label,
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Input に紐づけた基本形。`htmlFor` と `id` を揃えると、ラベルクリックで
 * 入力欄にフォーカスが移る。
 * @summary Input と組み合わせた基本形
 */
export const Default: Story = {
	render: () => (
		<div className="flex w-64 flex-col gap-1.5">
			<Label htmlFor="campsite">焚き火スポット名</Label>
			<Input id="campsite" placeholder="例: 三軒茶屋の路地裏" />
		</div>
	),
};

/**
 * 単体表示。テキストの太さと余白を確認するための story。
 * @summary 単体での見た目
 */
export const Standalone: Story = {
	args: {
		children: "薪の太さ",
	},
};

/**
 * 親の `group` に `data-disabled="true"` がついていると、ラベルが薄く
 * 落ちる。フィールド全体を非活性にしたいときの組み合わせ。
 * @summary 親グループが disabled のとき
 */
export const DisabledGroup: Story = {
	render: () => (
		<div className="group flex w-64 flex-col gap-1.5" data-disabled="true">
			<Label htmlFor="campsite-disabled">焚き火スポット名</Label>
			<Input id="campsite-disabled" disabled defaultValue="三軒茶屋" />
		</div>
	),
};
