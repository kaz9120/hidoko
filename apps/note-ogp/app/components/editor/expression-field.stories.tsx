import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { Fields } from "~/lib/og-templates";
import { DEFAULTS } from "~/lib/storage";
import { ExpressionField } from "./expression-field";

function Harness({ initial }: { initial: Partial<Fields> }) {
	const [state, setState] = useState<Fields>({ ...DEFAULTS, ...initial });
	return (
		<ExpressionField
			state={state}
			update={(patch) => setState((s) => ({ ...s, ...patch }))}
		/>
	);
}

/**
 * 余白量とジャンプ率の選択 UI。印象を決める 2 大パラメータを
 * それぞれ 3 段階の固定プリセットで切り替える（スライダーは出さない）。
 *
 * @summary 余白とジャンプ率の選択 UI
 */
const meta = {
	title: "note-ogp/Editor/ExpressionField",
	component: ExpressionField,
	parameters: { layout: "centered" },
	args: { state: DEFAULTS, update: () => {} },
	decorators: [
		(Story) => (
			<div className="w-80 bg-card p-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ExpressionField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 既定値（標準 × 標準）。切り替え可能なハーネス。 */
export const Default: Story = {
	render: () => <Harness initial={{}} />,
};

/** タイト × 強め。説明文が組み合わせに追従する。 */
export const TightHigh: Story = {
	render: () => <Harness initial={{ spacing: "tight", jumpRate: "high" }} />,
};

/** ゆったり × 控えめ。 */
export const LooseLow: Story = {
	render: () => <Harness initial={{ spacing: "loose", jumpRate: "low" }} />,
};
