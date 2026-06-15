import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import type { CropEngineHandle } from "~/hooks/use-crop-engine";
import type { CropRect } from "~/lib/crop-engine";

import { CropFloatingToolbar } from "./crop-floating-toolbar";

/**
 * 描画領域の上部中央に固定で出るクロップ HUD (#147 Phase 3)。アスペクト比 8 種、
 * 縦横切替、W×H 数値入力を持つ。確定仕様に沿って 2 段目ツールバーは撤去し、
 * これだけでクロップの「都度の調整」を完結させる。
 *
 * story では描画領域に見立てた Stage の中で、画像枠 (破線) と HUD を一緒に
 * 表示する。HUD は枠位置に関係なく常に Stage の上端中央に固定される。
 *
 * @summary 描画領域上部に固定のクロップ HUD
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
 * 描画領域を模した Stage。cropperRef は story 用のスタブで、setData を受けたら
 * cropRect を state に反映する。HUD は Stage の relative コンテナの上部中央に
 * 固定で配置される。
 */
function Stage({
	initialRect,
	imageWidth,
	imageHeight,
	initialAspectRatioId = "free",
	initialIsPortrait = false,
}: {
	initialRect: CropRect;
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
			style={{ width: imageWidth, height: imageHeight }}
		>
			<div className="absolute inset-0 bg-gradient-to-br from-[var(--ember-700)] via-[var(--ember-500)] to-[var(--moon)] opacity-40" />
			<div
				aria-hidden="true"
				className="absolute border border-[var(--ember-400)] border-dashed"
				style={{
					left: rect.x,
					top: rect.y,
					width: rect.width,
					height: rect.height,
				}}
			/>
			<CropFloatingToolbar
				aspectRatioId={aspectRatioId}
				cropRect={rect}
				cropperRef={cropperRef}
				isPortrait={isPortrait}
				onAspectRatioIdChange={setAspectRatioId}
				onPortraitChange={setIsPortrait}
			/>
		</div>
	);
}

/**
 * 枠が画像中央にある基本形。HUD は枠の位置に関係なく Stage 上端中央に固定。
 * @summary 中央 (基本形)
 */
export const Default: Story = {
	args: {
		aspectRatioId: "free",
		cropRect: { x: 60, y: 120, width: 600, height: 300 },
		cropperRef: { current: null },
		isPortrait: false,
		onAspectRatioIdChange: () => {},
		onPortraitChange: () => {},
	},
	render: (args) => (
		<Stage
			imageHeight={540}
			imageWidth={720}
			initialAspectRatioId={args.aspectRatioId}
			initialIsPortrait={args.isPortrait}
			initialRect={args.cropRect}
		/>
	),
};

/**
 * 枠を Stage 全体に広げた状態 (全画像選択)。HUD は同じく上端中央に固定で、
 * 旧版で発生していた「枠の内側下端へ反転して画像が隠れる」問題は起きない。
 * @summary 全画像選択でも同じ位置
 */
export const FullStage: Story = {
	args: {
		aspectRatioId: "free",
		cropRect: { x: 0, y: 0, width: 720, height: 540 },
		cropperRef: { current: null },
		isPortrait: false,
		onAspectRatioIdChange: () => {},
		onPortraitChange: () => {},
	},
	render: (args) => (
		<Stage
			imageHeight={540}
			imageWidth={720}
			initialAspectRatioId={args.aspectRatioId}
			initialIsPortrait={args.isPortrait}
			initialRect={args.cropRect}
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
		isPortrait: true,
		onAspectRatioIdChange: () => {},
		onPortraitChange: () => {},
	},
	render: (args) => (
		<Stage
			imageHeight={540}
			imageWidth={720}
			initialAspectRatioId={args.aspectRatioId}
			initialIsPortrait={args.isPortrait}
			initialRect={args.cropRect}
		/>
	),
};
