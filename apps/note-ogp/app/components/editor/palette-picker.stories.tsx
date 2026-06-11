import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { PaletteSelection } from "~/lib/og-templates";
import { buildPhotoPalettes } from "~/lib/photo-palette";
import { PalettePicker } from "./palette-picker";

// 写真から抽出した想定のサンプル。生成は決定的なので VRT でも安定する。
const SAMPLE_PHOTO_PALETTES = buildPhotoPalettes("#8a5a32");

/**
 * note OGP 編集パネルのカラーパレット選択チップ。8 つの名前付きパレットを
 * ベース / サブ / アクセントの帯で見せる。theme（ライト / ダーク）に応じて
 * チップの面も切り替わる。自由なカラーピッカーは置かないプリセット制。
 * 写真をアップロードすると、抽出色から生成した「馴染ませ / 引き立て」の
 * 2 候補が上段に並ぶ。
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

/** 写真由来の候補（馴染ませ / 引き立て）が上段に並んだ状態。 */
export const WithPhotoPalettes: Story = {
	args: { photoPalettes: SAMPLE_PHOTO_PALETTES, value: "photo-najimase" },
};

/** 写真由来の候補のダーク面。 */
export const WithPhotoPalettesDark: Story = {
	args: {
		theme: "dark",
		photoPalettes: SAMPLE_PHOTO_PALETTES,
		value: "photo-hikitate",
	},
};

/** state を持つインタラクティブ版。クリックで選択が切り替わる。 */
export const Interactive: Story = {
	render: (args) => {
		const [value, setValue] = useState<PaletteSelection>("takibi");
		return <PalettePicker {...args} value={value} onChange={setValue} />;
	},
};
