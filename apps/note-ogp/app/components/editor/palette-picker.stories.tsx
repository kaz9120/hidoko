import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { PaletteId } from "~/lib/og-templates";
import { PalettePicker } from "./palette-picker";

/**
 * note OGP 編集パネルのカラーパレット選択チップ。8 つの名前付きパレットを
 * ベース / サブ / アクセントの帯で見せる。theme（ライト / ダーク）に応じて
 * チップの面も切り替わる。自由なカラーピッカーは置かないプリセット制。
 *
 * @summary カラーパレット選択チップ
 */
const meta = {
	title: "note-ogp/Editor/PalettePicker",
	component: PalettePicker,
	parameters: { layout: "centered" },
	args: { value: "takibi", theme: "light", onChange: () => {} },
	argTypes: {
		theme: {
			control: { type: "inline-radio" },
			options: ["light", "dark"],
		},
	},
	decorators: [
		(Story) => (
			<div className="w-80 bg-card p-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof PalettePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/** ライト面のスウォッチ。焚き火が選択された状態。 */
export const Light: Story = {};

/** ダーク面のスウォッチ。各パレットの夜の面が見える。 */
export const Dark: Story = {
	args: { theme: "dark", value: "aikin" },
};

/** state を持つインタラクティブ版。クリックで選択が切り替わる。 */
export const Interactive: Story = {
	render: (args) => {
		const [value, setValue] = useState<PaletteId>("takibi");
		return <PalettePicker {...args} value={value} onChange={setValue} />;
	},
};
