import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
} from "./combobox";

/**
 * 検索可能なドロップダウン入力。`@base-ui/react` の Combobox を Hidoko の
 * トークン上に載せた wrapper で、入力欄でフィルタしながら選択肢を選ぶ。
 * 選択肢が多い、または部分一致検索が要るときに [Select](?path=/docs/shadcn-ui-select--docs)
 * の代わりに使う。
 *
 * @summary 検索可能な単一選択
 */
const meta = {
	title: "shadcn-ui/Combobox",
	component: Combobox,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

type Wood = { value: string; label: string };

const woods: Wood[] = [
	{ value: "oak", label: "楢" },
	{ value: "cherry", label: "桜" },
	{ value: "pine", label: "松" },
	{ value: "cedar", label: "杉" },
	{ value: "birch", label: "白樺" },
	{ value: "beech", label: "ブナ" },
];

/**
 * Input + Popover の基本形。入力欄でフィルタしつつ、候補から 1 つ選ぶ。
 * @summary 入力で絞り込む基本形
 */
export const Default: Story = {
	render: () => (
		<div className="w-64">
			<Combobox<Wood> items={woods} itemToStringLabel={(item) => item.label}>
				<ComboboxInput placeholder="樹種を探す">
					<ComboboxContent>
						<ComboboxEmpty>該当なし</ComboboxEmpty>
						<ComboboxList>
							{(item) => {
								const wood = item as Wood;
								return (
									<ComboboxItem key={wood.value} value={wood}>
										<ComboboxValue>{wood.label}</ComboboxValue>
									</ComboboxItem>
								);
							}}
						</ComboboxList>
					</ComboboxContent>
				</ComboboxInput>
			</Combobox>
		</div>
	),
};
