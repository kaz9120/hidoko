import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TooltipProvider } from "ui/components/tooltip";

import { ZOOM_STEP } from "~/components/canvas/viewport";

import { ZoomControlView } from "./zoom-control";

/**
 * ヘッダー1段目に常駐するズームコントロール。⊖ / % 表示 / ⊕ と、区切り線を
 * 挟んだ「画面に合わせる」を並べる。% 表示をクリックするとプリセット
 * (50 / 100 / 200 / Fit) のメニューが開く。
 *
 * 実画面では `ZoomControl` (context 接続版) が SnapcropContext の zoom を
 * 購読し、Viewport の ⌘+wheel ズームや ⌘0 / ⌘1 / ⌘− / ⌘+ ショートカットと
 * 常に同期する。Storybook では props 駆動の `ZoomControlView` に local state
 * を結線して、同じ挙動を再現している。
 *
 * @summary ヘッダー常駐のズームコントロール
 */
const meta = {
	title: "snapcrop/Layout/ZoomControl",
	component: ZoomControlView,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<TooltipProvider>
				<div className="flex items-center rounded-md bg-background px-4 py-2">
					<Story />
				</div>
			</TooltipProvider>
		),
	],
} satisfies Meta<typeof ZoomControlView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** ZoomControlView に local state を結線した操作可能なラッパー。 */
function StatefulZoomControl({ initialZoom }: { initialZoom: number }) {
	// 実画面では Viewport の fit ズームが画像とコンテナのサイズから決まる。
	// story では固定値で代用する。
	const fitZoom = 0.62;
	const [zoom, setZoom] = useState(initialZoom);
	const clamp = (next: number) => Math.min(8, Math.max(0.05, next));
	return (
		<ZoomControlView
			onFit={() => setZoom(fitZoom)}
			onZoomIn={() => setZoom((z) => clamp(z * ZOOM_STEP))}
			onZoomOut={() => setZoom((z) => clamp(z / ZOOM_STEP))}
			onZoomPreset={(next) => setZoom(clamp(next))}
			zoom={zoom}
		/>
	);
}

/**
 * 100% 表示の基本形。⊖ / ⊕ で段階ズーム、% クリックでプリセットメニュー、
 * 右端の「画面に合わせる」で fit (story では 62% 相当) に戻る。
 * @summary 100% の基本形
 */
export const Default: Story = {
	args: {
		zoom: 1,
		onZoomOut: () => {},
		onZoomIn: () => {},
		onZoomPreset: () => {},
		onFit: () => {},
	},
	render: () => <StatefulZoomControl initialZoom={1} />,
};

/**
 * 拡大中の表示。% は整数に丸めるので、ZOOM_STEP (1.25 倍) を重ねた端数も
 * そのまま読める。
 * @summary 拡大中 (250%)
 */
export const ZoomedIn: Story = {
	args: {
		zoom: 2.5,
		onZoomOut: () => {},
		onZoomIn: () => {},
		onZoomPreset: () => {},
		onFit: () => {},
	},
	render: () => <StatefulZoomControl initialZoom={2.5} />,
};

/**
 * fit ズームで縮小されている状態。ウィンドウより大きいスクショを開いた
 * 直後はこの見た目になる。
 * @summary fit で縮小中 (62%)
 */
export const FittedBelowHundred: Story = {
	args: {
		zoom: 0.62,
		onZoomOut: () => {},
		onZoomIn: () => {},
		onZoomPreset: () => {},
		onFit: () => {},
	},
	render: () => <StatefulZoomControl initialZoom={0.62} />,
};

/**
 * 画像未ロード時。site-header 上では `ZoomControl` が context の image を
 * 見て全体を disabled にする。
 * @summary 画像未ロード時 (disabled)
 */
export const Disabled: Story = {
	args: {
		zoom: 1,
		disabled: true,
		onZoomOut: () => {},
		onZoomIn: () => {},
		onZoomPreset: () => {},
		onFit: () => {},
	},
};
