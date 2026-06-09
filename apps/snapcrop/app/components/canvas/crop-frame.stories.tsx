import type { Meta, StoryObj } from "@storybook/react-vite";

import type { CropRect, UseCropEngineResult } from "~/hooks/use-crop-engine";

import { CropFrame } from "./crop-frame";

/**
 * クロップツールが選択されているとき stage 全体に重なる枠 UI。8 ハンドル +
 * 内側ドラッグで rect を編集し、外側は 4 分割 div で dim する。Storybook では
 * `useCropEngine` を呼べないので、`cropRect` だけ詰めたスタブハンドルで描画する。
 * インタラクションは story 上では発火しない。
 *
 * @summary 8 ハンドル + dim のクロップ枠
 */
const meta = {
	title: "snapcrop/Canvas/CropFrame",
	component: CropFrame,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story) => (
			<div className="relative h-[320px] w-[480px] overflow-hidden rounded-md border border-border bg-bg-base">
				{/* dim を映えさせるため、stage に写真風のグラデを敷く */}
				<div className="absolute inset-0 bg-gradient-to-br from-[var(--ember-700)] via-[var(--ember-500)] to-[var(--moon)] opacity-40" />
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof CropFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

function makeEngine(cropRect: CropRect | null): UseCropEngineResult {
	return {
		cropRect,
		aspectRatio: null,
		beginMove: () => {},
		beginResize: () => {},
		updateInteraction: () => {},
		endInteraction: () => {},
		handle: {
			setAspectRatio: () => {},
			setData: () => {},
			getData: () => cropRect ?? { x: 0, y: 0, width: 0, height: 0 },
			getImageData: () => ({ naturalWidth: 0, naturalHeight: 0 }),
			selectAll: () => {},
			toCanvas: () => document.createElement("canvas"),
			getSourceImage: () => null,
		},
	};
}

/**
 * 画像中央を縦長気味に切り出している典型状態。4 方向の dim と 8 ハンドルが
 * 揃って見える。
 * @summary 中央のクロップ枠
 */
export const Default: Story = {
	args: {
		engine: makeEngine({ x: 120, y: 60, width: 240, height: 200 }),
		zoom: 1,
	},
};

/**
 * `zoom = 0.5` で stage を縮めた状態。view 座標は cropRect × zoom で算出される
 * ので、枠サイズもそれに合わせて縮む。
 * @summary 縮小ステージでの枠
 */
export const Zoomed: Story = {
	args: {
		engine: makeEngine({ x: 80, y: 40, width: 320, height: 220 }),
		zoom: 0.5,
	},
};

/**
 * `cropRect = null` のとき、CropFrame は何も描画せず `null` を返す。画像が
 * まだ読み込まれていない / 全 dim を明示的に消したいときに通る分岐。
 * @summary cropRect なし
 */
export const NoRect: Story = {
	args: {
		engine: makeEngine(null),
		zoom: 1,
	},
};
