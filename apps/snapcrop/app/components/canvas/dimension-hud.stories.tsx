import type { Meta, StoryObj } from "@storybook/react-vite";

import type { CropRect } from "~/hooks/use-crop-engine";

import { DimensionHud } from "./dimension-hud";

/**
 * クロップ選択枠に追従する寸法 HUD。`W × H` を元画像の実ピクセル値で表示する。
 * 基本は枠の下端の外側、置けないときは枠の上 → 枠の内側下の順で退避し、
 * 左右も stage 境界内に clamp する。story では枠の位置が分かるように、
 * CropFrame と同色の破線ボックスを一緒に描いている。
 *
 * @summary 選択枠に追従する W × H 表示
 */
const meta = {
	title: "snapcrop/Canvas/DimensionHud",
	component: DimensionHud,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof DimensionHud>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 枠の位置を可視化するためのダミー選択枠 + stage コンテナ。 */
function Stage({
	rect,
	zoom,
	imageWidth,
	imageHeight,
}: {
	rect: CropRect;
	zoom: number;
	imageWidth: number;
	imageHeight: number;
}) {
	return (
		<div
			className="relative overflow-hidden rounded-md border border-border bg-bg-base"
			style={{ width: imageWidth * zoom, height: imageHeight * zoom }}
		>
			<div className="absolute inset-0 bg-gradient-to-br from-[var(--ember-700)] via-[var(--ember-500)] to-[var(--moon)] opacity-40" />
			<div
				aria-hidden="true"
				className="absolute border border-[var(--ember-400)] border-dashed"
				style={{
					left: rect.x * zoom,
					top: rect.y * zoom,
					width: rect.width * zoom,
					height: rect.height * zoom,
				}}
			/>
			<DimensionHud
				imageHeight={imageHeight}
				imageWidth={imageWidth}
				rect={rect}
				zoom={zoom}
			/>
		</div>
	);
}

/**
 * 画像中央の枠。HUD は枠の下端の外側に中央揃えで付く基本形。
 * @summary 枠の下に表示 (基本形)
 */
export const Default: Story = {
	args: {
		rect: { x: 120, y: 60, width: 240, height: 160 },
		zoom: 1,
		imageWidth: 480,
		imageHeight: 320,
	},
	render: (args) => <Stage {...args} />,
};

/**
 * 枠の下端が stage 下端に迫っていて HUD が下に入らないケース。枠の上側へ
 * 退避する。
 * @summary 下端付近では上へ退避
 */
export const NearBottom: Story = {
	args: {
		rect: { x: 120, y: 130, width: 240, height: 180 },
		zoom: 1,
		imageWidth: 480,
		imageHeight: 320,
	},
	render: (args) => <Stage {...args} />,
};

/**
 * 枠が stage の縦方向ほぼいっぱいで、上にも下にも置けないケース。枠の内側の
 * 下端へ退避する。
 * @summary 縦いっぱいでは内側へ退避
 */
export const FullHeight: Story = {
	args: {
		rect: { x: 120, y: 4, width: 240, height: 312 },
		zoom: 1,
		imageWidth: 480,
		imageHeight: 320,
	},
	render: (args) => <Stage {...args} />,
};

/**
 * 幅の狭い枠が stage 左端に張り付いているケース。中央揃えのままだと HUD が
 * stage 左へはみ出すので、left = 0 に clamp される。
 * @summary 左右は stage 内に clamp
 */
export const NearLeftEdge: Story = {
	args: {
		rect: { x: 0, y: 80, width: 24, height: 120 },
		zoom: 1,
		imageWidth: 480,
		imageHeight: 320,
	},
	render: (args) => <Stage {...args} />,
};

/**
 * `zoom = 0.5` の縮小表示。枠の追従位置は view 座標 (× zoom) だが、表示値は
 * 元画像の実ピクセル (960 × 440) のまま。文字サイズもズームの影響を受けない。
 * @summary ズーム時も実ピクセル値・固定文字サイズ
 */
export const Zoomed: Story = {
	args: {
		rect: { x: 240, y: 120, width: 960, height: 440 },
		zoom: 0.5,
		imageWidth: 960,
		imageHeight: 640,
	},
	render: (args) => <Stage {...args} />,
};
