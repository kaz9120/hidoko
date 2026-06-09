import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	NativeSelect,
	NativeSelectOptGroup,
	NativeSelectOption,
} from "./native-select";

/**
 * HTML の `<select>` を Hidoko のトークン上に載せた薄ラップ。OS ネイティブの
 * ドロップダウンをそのまま使うため、モバイルでの操作性が高い。リッチな
 * フィルタや検索が必要なときは [Select](?path=/docs/shadcn-ui-select--docs) を選ぶ。
 *
 * @summary ネイティブ `<select>` の wrap
 */
const meta = {
	title: "shadcn-ui/NativeSelect",
	component: NativeSelect,
} satisfies Meta<typeof NativeSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 単一グループの基本形。
 * @summary フラットな選択肢
 */
export const Default: Story = {
	render: () => (
		<NativeSelect defaultValue="oak">
			<NativeSelectOption value="oak">楢</NativeSelectOption>
			<NativeSelectOption value="cherry">桜</NativeSelectOption>
			<NativeSelectOption value="pine">松</NativeSelectOption>
			<NativeSelectOption value="birch">白樺</NativeSelectOption>
		</NativeSelect>
	),
};

/**
 * `<optgroup>` で選択肢を分類した例。
 * @summary グループ分けされた選択肢
 */
export const WithGroups: Story = {
	render: () => (
		<NativeSelect defaultValue="oak">
			<NativeSelectOptGroup label="広葉樹">
				<NativeSelectOption value="oak">楢</NativeSelectOption>
				<NativeSelectOption value="cherry">桜</NativeSelectOption>
			</NativeSelectOptGroup>
			<NativeSelectOptGroup label="針葉樹">
				<NativeSelectOption value="pine">松</NativeSelectOption>
				<NativeSelectOption value="cedar">杉</NativeSelectOption>
			</NativeSelectOptGroup>
		</NativeSelect>
	),
};

/**
 * 小さい size。フィルタバーなど、密度を上げたい場所で使う。
 * @summary コンパクトサイズ
 */
export const Small: Story = {
	render: () => (
		<NativeSelect size="sm" defaultValue="oak">
			<NativeSelectOption value="oak">楢</NativeSelectOption>
			<NativeSelectOption value="cherry">桜</NativeSelectOption>
		</NativeSelect>
	),
};

/**
 * 入力不能状態。
 * @summary 選択不能
 */
export const Disabled: Story = {
	render: () => (
		<NativeSelect disabled defaultValue="oak">
			<NativeSelectOption value="oak">楢</NativeSelectOption>
			<NativeSelectOption value="cherry">桜</NativeSelectOption>
		</NativeSelect>
	),
};
