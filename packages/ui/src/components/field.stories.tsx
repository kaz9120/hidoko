import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "./field";
import { Input } from "./input";

/**
 * Hidoko 標準のフォームグルーピング。ラベル・補助テキスト・入力・エラー
 * メッセージを 1 つの `Field` で束ねる。`react-hook-form` のような特定の
 * バリデーション基盤に依存しない、入力種別を問わない汎用 wrapper。
 *
 * @summary 入力 1 件分のグルーピング
 */
const meta = {
	title: "shadcn-ui/Field",
	component: Field,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * ラベル・補助テキスト・入力の縦並びの基本形。
 * @summary ラベル + 補助 + 入力
 */
export const Default: Story = {
	render: () => (
		<div className="w-72">
			<Field>
				<FieldLabel htmlFor="venue">焚き火の場所</FieldLabel>
				<Input id="venue" placeholder="例: 三軒茶屋の河川敷" />
				<FieldDescription>
					当日連絡できる場所を入れてください。
				</FieldDescription>
			</Field>
		</div>
	),
};

/**
 * `orientation="horizontal"` でラベルと入力を横並びにした形。Checkbox や
 * Switch のような小さい入力と相性がよい。
 * @summary 横並びの Field
 */
export const Horizontal: Story = {
	render: () => (
		<div className="w-96">
			<Field orientation="horizontal">
				<Checkbox id="bento" />
				<FieldContent>
					<FieldLabel htmlFor="bento">弁当を持ち込む</FieldLabel>
					<FieldDescription>
						現地で温められないので、温かいまま食べたい人向け。
					</FieldDescription>
				</FieldContent>
			</Field>
		</div>
	),
};

/**
 * `data-invalid` を立ててエラー状態を示し、`FieldError` でメッセージを出す形。
 * @summary バリデーション失敗時
 */
export const Invalid: Story = {
	render: () => (
		<div className="w-72">
			<Field data-invalid="true">
				<FieldLabel htmlFor="venue-invalid">焚き火の場所</FieldLabel>
				<Input id="venue-invalid" aria-invalid defaultValue="" />
				<FieldError errors={[{ message: "場所は必須です" }]} />
			</Field>
		</div>
	),
};

/**
 * `FieldSet` + `FieldLegend` で関連する複数の Field を 1 つの fieldset に
 * まとめた形。グループ全体のタイトルが必要なときに使う。
 * @summary fieldset でグルーピング
 */
export const Grouped: Story = {
	render: () => (
		<div className="w-96">
			<FieldSet>
				<FieldLegend>当日の持ち物</FieldLegend>
				<FieldGroup>
					<Field orientation="horizontal">
						<Checkbox id="firewood-gp" defaultChecked />
						<FieldContent>
							<FieldLabel htmlFor="firewood-gp">薪</FieldLabel>
							<FieldDescription>
								主催が用意するが、追加で持参すると喜ばれる。
							</FieldDescription>
						</FieldContent>
					</Field>
					<Field orientation="horizontal">
						<Checkbox id="bento-gp" />
						<FieldContent>
							<FieldLabel htmlFor="bento-gp">弁当</FieldLabel>
							<FieldDescription>
								現地で温められないので、温かいまま食べたい人向け。
							</FieldDescription>
						</FieldContent>
					</Field>
				</FieldGroup>
			</FieldSet>
		</div>
	),
};
