import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ImageField } from "./image-field";

/**
 * note OGP 編集パネルで使う画像アップロード欄。クリックでファイル選択を開き、
 * FileReader で dataURL 化して onChange に渡す。プレビューには 1280:670 の
 * アスペクト比で表示する。
 *
 * @summary 画像アップロード欄
 */
const meta = {
	title: "note-ogp/Editor/ImageField",
	component: ImageField,
	parameters: { layout: "centered" },
	args: { value: null, onChange: () => {} },
	decorators: [
		(Story) => (
			<div className="w-80 bg-card p-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ImageField>;

export default meta;

type Story = StoryObj<typeof meta>;

const SAMPLE_DATA_URL =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 670"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a1a"/><stop offset="1" stop-color="#0e0a06"/></linearGradient></defs><rect width="1280" height="670" fill="url(#g)"/></svg>`,
	);

/** 画像未選択状態。クリック領域だけが見える。 */
export const Empty: Story = {};

/** 画像選択済み。プレビュー＋差し替え／削除ボタン。 */
export const WithImage: Story = {
	args: { value: SAMPLE_DATA_URL },
};

/** state を持つ起動可能なインタラクティブ版（クリックで差し替えできる）。 */
export const Interactive: Story = {
	render: () => {
		const [value, setValue] = useState<string | null>(null);
		return <ImageField value={value} onChange={setValue} />;
	},
};
