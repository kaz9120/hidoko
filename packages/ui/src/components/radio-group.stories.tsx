import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

/**
 * 複数の選択肢から 1 つだけ選ぶラジオグループ。Radix の `RadioGroup` を
 * Hidoko のトークン上に載せた wrapper。3 件以下の排他選択で使う。4 件以上
 * のときは [Select](?path=/docs/shadcn-ui-select--docs) を検討する。
 *
 * @summary 排他選択のラジオグループ
 */
const meta = {
	title: "shadcn-ui/RadioGroup",
	component: RadioGroup,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 3 つの選択肢から 1 つを選ぶ基本形。デフォルトで先頭が選ばれている。
 * @summary 3 択の基本形
 */
export const Default: Story = {
	render: () => (
		<RadioGroup defaultValue="charcoal">
			<div className="flex items-center gap-2">
				<RadioGroupItem id="firewood" value="firewood" />
				<Label htmlFor="firewood">薪</Label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem id="charcoal" value="charcoal" />
				<Label htmlFor="charcoal">炭</Label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem id="briquette" value="briquette" />
				<Label htmlFor="briquette">オガ備長炭</Label>
			</div>
		</RadioGroup>
	),
};

/**
 * グループ全体を `disabled` にした状態。フォーム送信中や、前段の選択に
 * よって解放されていないグループで使う。
 * @summary グループ全体が操作不能
 */
export const Disabled: Story = {
	render: () => (
		<RadioGroup defaultValue="charcoal" disabled>
			<div className="flex items-center gap-2">
				<RadioGroupItem id="firewood-d" value="firewood" />
				<Label htmlFor="firewood-d">薪</Label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem id="charcoal-d" value="charcoal" />
				<Label htmlFor="charcoal-d">炭</Label>
			</div>
		</RadioGroup>
	),
};
