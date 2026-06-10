import type { Meta, StoryObj } from "@storybook/react-vite";

import { SnapcropProvider } from "~/contexts/snapcrop-context";
import type { UseArrowEngineResult } from "~/hooks/use-arrow-engine";
import type { ArrowAnnotation } from "~/lib/arrow-engine";

import { ArrowInteractionLayer } from "./arrow-interaction-layer";

/**
 * 矢印ツール選択中だけ stage を覆う透明な hit layer。pointerdown で線分への
 * 距離ベースの hit test を行い、既存矢印があれば選択 + 移動開始、なければ
 * 描画開始する。見た目は `cursor: crosshair` の透明 div だけなので、
 * Storybook では境界が分かるよう枠付きコンテナで囲み、`arrows` を inline
 * fixture で渡す。
 *
 * 実 UI では `useSnapcrop` の `spacePressedRef` も参照するため、
 * `SnapcropProvider` で wrap している (画像なし初期状態のまま story 上は
 * 操作されない)。
 *
 * @summary 矢印ツールの透明 hit レイヤー
 */
const meta = {
	title: "snapcrop/Canvas/ArrowInteractionLayer",
	component: ArrowInteractionLayer,
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
} satisfies Meta<typeof ArrowInteractionLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

const STUB_ENGINE: UseArrowEngineResult = {
	renderedArrows: [],
	previewArrow: null,
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

const mkArrow = (overrides: Partial<ArrowAnnotation>): ArrowAnnotation => ({
	id: "a1",
	kind: "arrow",
	x1: 0,
	y1: 0,
	x2: 100,
	y2: 60,
	line: "straight",
	startCap: "none",
	endCap: "arrow",
	color: "#ef4444",
	thickness: "md",
	createdAt: 0,
	...overrides,
});

/**
 * 既存矢印がない空状態。stage 全体が「次のドラッグで描画開始」になる。
 * 視覚的には透明なので、外側のコンテナだけが見える。
 * @summary 空状態 (描画待ち)
 */
export const Empty: Story = {
	args: {
		engine: STUB_ENGINE,
		arrows: [],
		zoom: 1,
		getImagePoint: () => null,
	},
};

/**
 * 既存矢印が 2 本ある状態。hit test は線分 (曲線は折れ線近似) からの距離で
 * 判定され、線上 pointerdown で `selectAnnotation` + `beginMove` を発火させる
 * 想定。Storybook では実際のインタラクションは起こらないが、hit 領域
 * そのものは透明レイヤーが覆う。
 * @summary 既存矢印と共存
 */
export const WithArrows: Story = {
	args: {
		engine: STUB_ENGINE,
		arrows: [
			mkArrow({ id: "a", x1: 60, y1: 40, x2: 220, y2: 140 }),
			mkArrow({
				id: "b",
				x1: 260,
				y1: 220,
				x2: 420,
				y2: 80,
				line: "curve",
				color: "#22c55e",
			}),
		],
		zoom: 1,
		getImagePoint: () => null,
	},
};
