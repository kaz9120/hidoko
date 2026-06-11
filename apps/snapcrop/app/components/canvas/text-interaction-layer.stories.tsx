import type { Meta, StoryObj } from "@storybook/react-vite";

import { SnapcropProvider } from "~/contexts/snapcrop-context";
import type { UseTextEngineResult } from "~/hooks/use-text-engine";
import type { TextAnnotation } from "~/lib/text-engine";

import { TextInteractionLayer } from "./text-interaction-layer";

/**
 * テキストツール選択中だけ stage を覆う透明な hit layer。pointerdown で外接
 * 矩形への hit test を行い、既存テキストがあれば選択 + 移動開始、空クリック
 * (= 動かさず pointerup) でその位置から新規入力を開始、ダブルクリックで
 * 再編集に入る。見た目は `cursor: text` の透明 div だけなので、Storybook
 * では境界が分かるよう枠付きコンテナで囲み、`texts` を inline fixture で渡す。
 *
 * 実 UI では `useSnapcrop` の `spacePressedRef` も参照するため、
 * `SnapcropProvider` で wrap している (画像なし初期状態のまま story 上は
 * 操作されない)。
 *
 * @summary テキストツールの透明 hit レイヤー
 */
const meta = {
	title: "snapcrop/Canvas/TextInteractionLayer",
	component: TextInteractionLayer,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story) => (
			<SnapcropProvider>
				<div className="relative h-[260px] w-[480px] overflow-hidden rounded-md border border-dashed border-border bg-bg-raised">
					<Story />
				</div>
			</SnapcropProvider>
		),
	],
} satisfies Meta<typeof TextInteractionLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

const STUB_ENGINE: UseTextEngineResult = {
	renderedTexts: [],
	isInteracting: false,
	editing: null,
	beginMove: () => {},
	updateInteraction: () => {},
	endInteraction: () => {},
	cancelInteraction: () => {},
	beginCreate: () => {},
	beginEdit: () => {},
	commitEdit: () => {},
	cancelEdit: () => {},
	handle: {
		isInteracting: () => false,
		cancelInteraction: () => {},
	},
};

const mkText = (overrides: Partial<TextAnnotation>): TextAnnotation => ({
	id: "t1",
	kind: "text",
	x: 40,
	y: 40,
	text: "テキスト",
	fontFamily: "sans",
	fontSize: 24,
	align: "left",
	bold: false,
	italic: false,
	color: "#ef4444",
	background: "none",
	createdAt: 0,
	...overrides,
});

/**
 * 既存テキストがない空状態。stage 全体が「次のクリックで入力開始」になる。
 * 視覚的には透明なので、外側のコンテナだけが見える。
 * @summary 空状態 (入力待ち)
 */
export const Empty: Story = {
	args: {
		engine: STUB_ENGINE,
		texts: [],
		zoom: 1,
		getImagePoint: () => null,
	},
};

/**
 * 既存テキストが 2 つある状態。hit test は外接矩形 (背景があれば背景込み)
 * で判定され、矩形内の pointerdown で `selectAnnotation` + `beginMove` を、
 * ダブルクリックで `beginEdit` を発火させる想定。Storybook では実際の
 * インタラクションは起こらないが、hit 領域そのものは透明レイヤーが覆う。
 * @summary 既存テキストと共存
 */
export const WithTexts: Story = {
	args: {
		engine: STUB_ENGINE,
		texts: [
			mkText({ id: "a", x: 60, y: 50, text: "ここに注目" }),
			mkText({
				id: "b",
				x: 240,
				y: 160,
				text: "背景付き\n2 行目",
				color: "#ffffff",
				background: "black",
			}),
		],
		zoom: 1,
		getImagePoint: () => null,
	},
};
