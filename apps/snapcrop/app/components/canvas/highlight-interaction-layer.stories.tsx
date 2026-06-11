import type { Meta, StoryObj } from "@storybook/react-vite";

import { SnapcropProvider } from "~/contexts/snapcrop-context";
import type { UseHighlightEngineResult } from "~/hooks/use-highlight-engine";
import type { HighlightAnnotation } from "~/lib/highlight-engine";

import { HighlightInteractionLayer } from "./highlight-interaction-layer";

/**
 * マーカーツール選択中だけ stage を覆う透明な hit layer。pointerdown で
 * 線分への距離ベースの hit test を行い、既存ハイライトがあれば選択 + 移動
 * 開始、なければ描画開始する。見た目は `cursor: crosshair` の透明 div だけ
 * なので、Storybook では境界が分かるよう枠付きコンテナで囲み、`highlights`
 * を inline fixture で渡す。
 *
 * 実 UI では `useSnapcrop` の `spacePressedRef` も参照するため、
 * `SnapcropProvider` で wrap している (画像なし初期状態のまま story 上は
 * 操作されない)。
 *
 * @summary マーカーツールの透明 hit レイヤー
 */
const meta = {
	title: "snapcrop/Canvas/HighlightInteractionLayer",
	component: HighlightInteractionLayer,
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
} satisfies Meta<typeof HighlightInteractionLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

const STUB_ENGINE: UseHighlightEngineResult = {
	renderedHighlights: [],
	previewHighlight: null,
	isInteracting: false,
	beginDraw: () => {},
	beginMove: () => {},
	beginEndpointDrag: () => {},
	updateInteraction: () => {},
	endInteraction: () => {},
	cancelInteraction: () => {},
	handle: {
		isInteracting: () => false,
		cancelInteraction: () => {},
	},
};

const mkHighlight = (
	overrides: Partial<HighlightAnnotation>,
): HighlightAnnotation => ({
	id: "h1",
	kind: "highlight",
	x1: 0,
	y1: 0,
	x2: 100,
	y2: 60,
	color: "#fde047",
	opacity: 0.4,
	thickness: "md",
	createdAt: 0,
	...overrides,
});

/**
 * 既存ハイライトがない空状態。stage 全体が「次のドラッグで描画開始」になる。
 * 視覚的には透明なので、外側のコンテナだけが見える。
 * @summary 空状態 (描画待ち)
 */
export const Empty: Story = {
	args: {
		engine: STUB_ENGINE,
		highlights: [],
		zoom: 1,
		getImagePoint: () => null,
	},
};

/**
 * 既存ハイライトが 2 本ある状態。hit test は線分からの距離 (帯の半分 + 余白)
 * で判定され、帯上 pointerdown で `selectAnnotation` + `beginMove` を発火
 * させる想定。Storybook では実際のインタラクションは起こらないが、hit 領域
 * そのものは透明レイヤーが覆う。
 * @summary 既存ハイライトと共存
 */
export const WithHighlights: Story = {
	args: {
		engine: STUB_ENGINE,
		highlights: [
			mkHighlight({ id: "a", x1: 60, y1: 60, x2: 360, y2: 60 }),
			mkHighlight({
				id: "b",
				x1: 100,
				y1: 180,
				x2: 420,
				y2: 150,
				color: "#93c5fd",
				thickness: "lg",
			}),
		],
		zoom: 1,
		getImagePoint: () => null,
	},
};
