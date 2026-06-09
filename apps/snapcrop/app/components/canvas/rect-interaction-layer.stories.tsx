import type { Meta, StoryObj } from "@storybook/react-vite";

import { SnapcropProvider } from "~/contexts/snapcrop-context";
import type { UseRectEngineResult } from "~/hooks/use-rect-engine";
import type { RectAnnotation } from "~/lib/rect-engine";

import { RectInteractionLayer } from "./rect-interaction-layer";

/**
 * 矩形ツール選択中だけ stage を覆う透明な hit layer。pointerdown で hit test
 * を行い、既存矩形があれば選択 + 移動開始、なければ描画開始する。
 * 見た目は `cursor: crosshair` の透明 div だけなので、Storybook では境界が
 * 分かるよう枠付きコンテナで囲み、`annotations` を inline fixture で渡す。
 *
 * 実 UI では `useSnapcrop` の `spacePressedRef` も参照するため、
 * `SnapcropProvider` で wrap している (画像なし初期状態のまま story 上は
 * 操作されない)。
 *
 * @summary 矩形ツールの透明 hit レイヤー
 */
const meta = {
	title: "snapcrop/Canvas/RectInteractionLayer",
	component: RectInteractionLayer,
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
} satisfies Meta<typeof RectInteractionLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

const STUB_ENGINE: UseRectEngineResult = {
	renderedAnnotations: [],
	previewRect: null,
	isInteracting: false,
	beginDraw: () => {},
	beginMove: () => {},
	beginResize: () => {},
	updateInteraction: () => {},
	endInteraction: () => {},
	cancelInteraction: () => {},
	handle: {
		isInteracting: () => false,
		cancelInteraction: () => {},
	},
};

const mkRect = (overrides: Partial<RectAnnotation>): RectAnnotation => ({
	id: "r1",
	kind: "rect",
	x: 0,
	y: 0,
	width: 100,
	height: 60,
	style: "outline",
	color: "#ef4444",
	thickness: "md",
	createdAt: 0,
	...overrides,
});

/**
 * 既存矩形がない空状態。stage 全体が「次のドラッグで描画開始」になる。
 * 視覚的には透明なので、外側のコンテナだけが見える。
 * @summary 空状態 (描画待ち)
 */
export const Empty: Story = {
	args: {
		engine: STUB_ENGINE,
		annotations: [],
		getImagePoint: () => null,
	},
};

/**
 * 既存矩形が 2 つある状態。hit test がそれぞれの矩形領域内 pointerdown で
 * `selectAnnotation` + `beginMove` を発火させる想定。Storybook では実際の
 * インタラクションは起こらないが、hit 領域そのものは透明レイヤーが覆う。
 * @summary 既存矩形と共存
 */
export const WithAnnotations: Story = {
	args: {
		engine: STUB_ENGINE,
		annotations: [
			mkRect({ id: "a", x: 60, y: 40, width: 160, height: 100 }),
			mkRect({
				id: "b",
				x: 260,
				y: 120,
				width: 160,
				height: 100,
				color: "#22c55e",
			}),
		],
		getImagePoint: () => null,
	},
};
