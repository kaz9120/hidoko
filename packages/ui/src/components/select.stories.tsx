import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "./select";

/**
 * Radix の `Select` を Hidoko のトークン上に載せた wrapper。リッチな
 * ドロップダウン UI を提供し、検索が要らない単一選択に向く。検索が
 * 要るときは [Combobox](?path=/docs/shadcn-ui-combobox--docs) を選ぶ。
 *
 * @summary 単一選択ドロップダウン
 */
const meta = {
	title: "shadcn-ui/Select",
	component: Select,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Trigger と Content を組んだ基本形。
 * @summary 基本形
 */
export const Default: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="w-48">
				<SelectValue placeholder="薪の太さを選ぶ" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="thin">細枝（焚き付け）</SelectItem>
				<SelectItem value="medium">中割（火を育てる）</SelectItem>
				<SelectItem value="thick">太薪（長く燃やす）</SelectItem>
			</SelectContent>
		</Select>
	),
};

/**
 * `SelectGroup` + `SelectLabel` で見出しを入れた例。
 * @summary グループ見出し付き
 */
export const WithGroups: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="w-48">
				<SelectValue placeholder="樹種を選ぶ" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>広葉樹</SelectLabel>
					<SelectItem value="oak">楢</SelectItem>
					<SelectItem value="cherry">桜</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectGroup>
					<SelectLabel>針葉樹</SelectLabel>
					<SelectItem value="pine">松</SelectItem>
					<SelectItem value="cedar">杉</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	),
};

/**
 * 入力不能状態。フォーム送信中など。
 * @summary 選択不能
 */
export const Disabled: Story = {
	render: () => (
		<Select disabled defaultValue="oak">
			<SelectTrigger className="w-48">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="oak">楢</SelectItem>
			</SelectContent>
		</Select>
	),
};

/**
 * `size="sm"` の Trigger。密度を上げたい場所で使う。
 * @summary 小さい Trigger
 */
export const Small: Story = {
	render: () => (
		<Select>
			<SelectTrigger size="sm" className="w-40">
				<SelectValue placeholder="樹種" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="oak">楢</SelectItem>
				<SelectItem value="cherry">桜</SelectItem>
			</SelectContent>
		</Select>
	),
};
