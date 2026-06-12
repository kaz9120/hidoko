import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { Fields } from "~/lib/og-templates";
import { TEMPLATES } from "~/lib/og-templates";
import { DEFAULTS } from "~/lib/storage";
import { PhotoStyleField } from "./photo-style-field";

const SAMPLE_DATA_URL =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 670"><rect width="1280" height="670" fill="#3a2a1a"/></svg>`,
	);

const COVER = TEMPLATES.find((t) => t.id === "cover") ?? TEMPLATES[1];
const QUIET = TEMPLATES.find((t) => t.id === "quiet") ?? TEMPLATES[2];

function Harness({ initial }: { initial: Partial<Fields> }) {
	const [state, setState] = useState<Fields>({ ...DEFAULTS, ...initial });
	return (
		<PhotoStyleField
			state={state}
			update={(patch) => setState((s) => ({ ...s, ...patch }))}
			tpl={state.templateId === "quiet" ? QUIET : COVER}
		/>
	);
}

/**
 * 写真の加工プリセット（5 種）とテキスト保護方式（4 方式）の選択 UI。
 * 加工は写真を使う全テンプレで出るが、保護方式は写真の上に文字が乗る
 * Cover の全面配置でだけ表示する。写真がないあいだ加工は無効化される。
 *
 * @summary 写真の加工と文字の保護の選択 UI
 */
const meta = {
	title: "note-ogp/Editor/PhotoStyleField",
	component: PhotoStyleField,
	parameters: { layout: "centered" },
	args: { state: DEFAULTS, update: () => {}, tpl: COVER },
	decorators: [
		(Story) => (
			<div className="w-80 bg-card p-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof PhotoStyleField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Cover 全面 × 写真あり。加工 5 種と保護 4 方式の両方が出る。 */
export const CoverFull: Story = {
	render: () => (
		<Harness
			initial={{
				templateId: "cover",
				photoLayout: "full",
				image: SAMPLE_DATA_URL,
			}}
		/>
	),
};

/** Cover 片寄せ。テキストが色面側にあるため、保護方式は出ない。 */
export const CoverEdge: Story = {
	render: () => (
		<Harness
			initial={{
				templateId: "cover",
				photoLayout: "edge",
				image: SAMPLE_DATA_URL,
			}}
		/>
	),
};

/** 写真なし。加工は無効化され、案内文に変わる。 */
export const NoImage: Story = {
	render: () => (
		<Harness initial={{ templateId: "cover", photoLayout: "full" }} />
	),
};

/** Quiet。加工だけが出る（保護方式は Cover 全面専用）。 */
export const Quiet: Story = {
	render: () => (
		<Harness initial={{ templateId: "quiet", image: SAMPLE_DATA_URL }} />
	),
};
