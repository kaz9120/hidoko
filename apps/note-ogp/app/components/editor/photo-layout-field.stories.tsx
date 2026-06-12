import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { Fields } from "~/lib/og-templates";
import { TEMPLATES } from "~/lib/og-templates";
import { DEFAULTS } from "~/lib/storage";
import { PhotoLayoutField } from "./photo-layout-field";

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
		<PhotoLayoutField
			state={state}
			update={(patch) => setState((s) => ({ ...s, ...patch }))}
			tpl={state.templateId === "quiet" ? QUIET : COVER}
		/>
	);
}

/**
 * 写真の配置型（全面 / 片寄せ / 角版）・左右入れ替え・注視点 9 点グリッドの
 * 選択 UI。配置型と左右入れ替えは Cover 専用で、注視点は写真をクロップする
 * テンプレ共通。写真がないあいだ注視点は無効化される。
 *
 * @summary 写真の配置と注視点の選択 UI
 */
const meta = {
	title: "note-ogp/Editor/PhotoLayoutField",
	component: PhotoLayoutField,
	parameters: { layout: "centered" },
	args: { state: DEFAULTS, update: () => {}, tpl: COVER },
	decorators: [
		(Story) => (
			<div className="w-80 bg-card p-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof PhotoLayoutField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Cover × 写真あり。配置 3 型と注視点グリッドが操作できる。 */
export const Cover: Story = {
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

/** Cover × 片寄せ。左右入れ替えのトグルが現れる。 */
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

/** 写真なし。注視点グリッドは無効化され、案内文に変わる。 */
export const NoImage: Story = {
	render: () => (
		<Harness initial={{ templateId: "cover", photoLayout: "full" }} />
	),
};

/** Quiet。配置型は出ず、注視点だけが操作できる。 */
export const Quiet: Story = {
	render: () => (
		<Harness initial={{ templateId: "quiet", image: SAMPLE_DATA_URL }} />
	),
};
