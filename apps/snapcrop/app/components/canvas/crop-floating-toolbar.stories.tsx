import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import type { CropEngineHandle } from "~/hooks/use-crop-engine";
import type { CropRect } from "~/lib/crop-engine";

import { CropFloatingToolbar } from "./crop-floating-toolbar";

/**
 * クロップ枠の上辺に貼り付くフローティング HUD。アスペクト比プリセット 8 種、
 * 縦横切替、W×H 数値入力を持つ。確定仕様 (#147 Phase 3) に沿って 2 段目
 * ツールバーは撤去し、これだけでクロップの「都度の調整」を完結させる。
 *
 * story では Stage コンポーネントで枠位置を可視化し、ToggleGroup 操作で
 * cropRect / aspectRatioId / isPortrait の値が変わる様子を確認できる。
 *
 * @summary クロップ枠に貼り付くフローティング HUD
 */
const meta = {
	title: "snapcrop/Canvas/CropFloatingToolbar",
	component: CropFloatingToolbar,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof CropFloatingToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 枠位置を可視化する stage コンテナ。cropperRef は story 用のスタブで、
 * setAspectRatio / setData を受けたら cropRect を state に反映する。実機の
 * use-crop-engine の挙動を完全再現はしないが、HUD の見た目とインタラクション
 * を確認するには十分。
 */
function Stage({
	initialRect,
	zoom,
	imageWidth,
	imageHeight,
	initialAspectRatioId = "free",
	initialIsPortrait = false,
}: {
	initialRect: CropRect;
	zoom: number;
	imageWidth: number;
	imageHeight: number;
	initialAspectRatioId?: string;
	initialIsPortrait?: boolean;
}) {
	const [rect, setRect] = useState<CropRect>(initialRect);
	const [aspectRatioId, setAspectRatioId] = useState(initialAspectRatioId);
	const [isPortrait, setIsPortrait] = useState(initialIsPortrait);

	const cropperRef = useRef<CropEngineHandle | null>(null);
	cropperRef.current = {
		setAspectRatio: () => {
			// story では aspectRatio をそのまま反映する仕組みは省く
			// (HUD 単体の挙動確認が目的)
		},
		setData: (partial) => {
			setRect((prev) => ({
				x: partial.x ?? prev.x,
				y: partial.y ?? prev.y,
				width: partial.width ?? prev.width,
				height: partial.height ?? prev.height,
			}));
		},
		getData: () => rect,
		getImageData: () => ({
			naturalWidth: imageWidth,
			naturalHeight: imageHeight,
		}),
		selectAll: () => {
			setRect({ x: 0, y: 0, width: imageWidth, height: imageHeight });
		},
		toCanvas: () => document.createElement("canvas"),
		getSourceImage: () => null,
	};

	return (
		<div
			className="relative overflow-visible rounded-md border border-border bg-bg-base"
			style={{ width: imageWidth * zoom, height: imageHeight * zoom }}
		>
			<div className="absolute inset-0 bg-gradient-to-br from-[var(--ember-700)] via-[var(--ember-500)] to-[var(--moon)] opacity-40" />
			<div
				aria-hidden="true"
				className="absolute border border-[var(--ember-400)]"
				style={{
					left: rect.x * zoom,
					top: rect.y * zoom,
					width: rect.width * zoom,
					height: rect.height * zoom,
				}}
			/>
			<CropFloatingToolbar
				aspectRatioId={aspectRatioId}
				cropRect={rect}
				cropperRef={cropperRef}
				imageHeight={imageHeight}
				imageWidth={imageWidth}
				isPortrait={isPortrait}
				onAspectRatioIdChange={setAspectRatioId}
				onPortraitChange={setIsPortrait}
				visible={true}
				zoom={zoom}
			/>
		</div>
	);
}

/**
 * 枠が画像中央にある基本形。HUD は枠の上辺に貼り付き、上に余白があるので
 * 通常表示 (枠の外側上) になる。
 * @summary 中央 (基本形)
 */
export const Default: Story = {
	args: {
		aspectRatioId: "free",
		cropRect: { x: 60, y: 120, width: 600, height: 300 },
		cropperRef: { current: null },
		imageHeight: 540,
		imageWidth: 720,
		isPortrait: false,
		onAspectRatioIdChange: () => {},
		onPortraitChange: () => {},
		visible: true,
		zoom: 1,
	},
	render: (args) => (
		<Stage
			imageHeight={args.imageHeight}
			imageWidth={args.imageWidth}
			initialAspectRatioId={args.aspectRatioId}
			initialIsPortrait={args.isPortrait}
			initialRect={args.cropRect}
			zoom={args.zoom}
		/>
	),
};

/**
 * 枠が stage 上端に張り付いているケース。クロップ HUD は forceTop=true を
 * 渡しているので flip ロジックが効かず、bbox 上辺の外側にそのまま出る。
 * 実機では viewport 側に topReserved の余白があるので画面外には出ない
 * (story では stage の上に切れる)。
 * @summary 上端でも常に上に出る (forceTop)
 */
export const NearTop: Story = {
	args: {
		aspectRatioId: "16:9",
		cropRect: { x: 60, y: 8, width: 600, height: 338 },
		cropperRef: { current: null },
		imageHeight: 540,
		imageWidth: 720,
		isPortrait: false,
		onAspectRatioIdChange: () => {},
		onPortraitChange: () => {},
		visible: true,
		zoom: 1,
	},
	render: (args) => (
		<Stage
			imageHeight={args.imageHeight}
			imageWidth={args.imageWidth}
			initialAspectRatioId={args.aspectRatioId}
			initialIsPortrait={args.isPortrait}
			initialRect={args.cropRect}
			zoom={args.zoom}
		/>
	),
};

/**
 * 縦向きトグルが押された状態。アスペクト比 16:9 が 9:16 として効くシナリオ。
 * @summary 縦向きトグル ON
 */
export const Portrait: Story = {
	args: {
		aspectRatioId: "16:9",
		cropRect: { x: 240, y: 80, width: 240, height: 426 },
		cropperRef: { current: null },
		imageHeight: 540,
		imageWidth: 720,
		isPortrait: true,
		onAspectRatioIdChange: () => {},
		onPortraitChange: () => {},
		visible: true,
		zoom: 1,
	},
	render: (args) => (
		<Stage
			imageHeight={args.imageHeight}
			imageWidth={args.imageWidth}
			initialAspectRatioId={args.aspectRatioId}
			initialIsPortrait={args.isPortrait}
			initialRect={args.cropRect}
			zoom={args.zoom}
		/>
	),
};

/**
 * `zoom = 0.5` の縮小表示。枠の追従位置は view 座標 (× zoom) だが、HUD 本体
 * のサイズはズームの影響を受けず CSS px のまま。
 * @summary ズーム時も HUD は固定サイズ
 */
export const Zoomed: Story = {
	args: {
		aspectRatioId: "free",
		cropRect: { x: 120, y: 240, width: 1200, height: 600 },
		cropperRef: { current: null },
		imageHeight: 1080,
		imageWidth: 1440,
		isPortrait: false,
		onAspectRatioIdChange: () => {},
		onPortraitChange: () => {},
		visible: true,
		zoom: 0.5,
	},
	render: (args) => (
		<Stage
			imageHeight={args.imageHeight}
			imageWidth={args.imageWidth}
			initialAspectRatioId={args.aspectRatioId}
			initialIsPortrait={args.isPortrait}
			initialRect={args.cropRect}
			zoom={args.zoom}
		/>
	),
};
