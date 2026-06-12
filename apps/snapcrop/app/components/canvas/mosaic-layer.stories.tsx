import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";

import type { RectAnnotation } from "~/lib/rect-engine";

import { MosaicLayer } from "./mosaic-layer";

/**
 * `style === "mosaic"` の矩形だけを 1 枚の `<canvas>` に焼き、stage に重ねる
 * レイヤー。SVG では表現できない「ピクセル化」を担う。元画像の `ImageData` を
 * `ref` でキャッシュし、ドラッグ中の毎フレーム計算で `getImageData` を呼び
 * 直さない設計。
 *
 * Storybook では実画像と `<img>` ref を組み立てるのが重いので、空配列で
 * 「canvas は mount されるが何も描画されない」状態だけ確認する。実際の
 * モザイク描画は ImageStage に組み込んだ状態でないと確認しづらい。
 *
 * @summary モザイク矩形を焼く canvas レイヤー
 */
const meta: Meta<typeof MosaicLayer> = {
	title: "snapcrop/Canvas/MosaicLayer",
	component: MosaicLayer,
	parameters: {
		layout: "padded",
	},
};

export default meta;

type Story = StoryObj<typeof MosaicLayer>;

const STUB_SRC =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300">
			<rect width="480" height="300" fill="#1a0d05"/>
			<circle cx="240" cy="150" r="80" fill="#f47d3a"/>
		</svg>`,
	);

const mkRect = (overrides: Partial<RectAnnotation>): RectAnnotation => ({
	id: "m1",
	kind: "rect",
	x: 0,
	y: 0,
	width: 120,
	height: 80,
	style: "mosaic",
	color: "#3b82f6",
	thickness: "md",
	createdAt: 0,
	zIndex: 0,
	...overrides,
});

function Frame({ annotations }: { annotations: readonly RectAnnotation[] }) {
	const imgRef = useRef<HTMLImageElement | null>(null);
	return (
		<div className="relative h-[300px] w-[480px] overflow-hidden rounded-md border border-border bg-bg-raised">
			<img
				alt="モザイク確認用のスタブ画像"
				className="pointer-events-none absolute inset-0 block size-full select-none"
				draggable={false}
				ref={imgRef}
				src={STUB_SRC}
			/>
			<MosaicLayer
				annotations={annotations}
				imageHeight={300}
				imageSrc={STUB_SRC}
				imageWidth={480}
				imgRef={imgRef}
			/>
		</div>
	);
}

/**
 * モザイク annotation が無い状態。canvas は mount されるが空 (clearRect 後に
 * cells.length === 0 で early return)。実 UI ではこの状態が通常で、ユーザが
 * モザイクツールを使ったときだけ canvas に何かが乗る。
 * @summary 空 (canvas のみ mount)
 */
export const Empty: Story = {
	render: () => <Frame annotations={[]} />,
};

/**
 * モザイク矩形を 1 つ持つ fixture。`<img>` がロード済になった後に
 * `readImagePixels` が走り、cellSize ごとに平均色で塗りつぶす。Storybook 上
 * では非同期描画になるため、初回スナップショットでは反映が間に合わないことが
 * ある。
 * @summary モザイク矩形 1 つ
 */
export const SingleMosaic: Story = {
	render: () => (
		<Frame
			annotations={[
				mkRect({
					id: "m-center",
					x: 160,
					y: 100,
					width: 160,
					height: 100,
					thickness: "md",
				}),
			]}
		/>
	),
};
