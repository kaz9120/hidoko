import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";

import {
	type LoadedImage,
	SnapcropProvider,
} from "~/contexts/snapcrop-context";
import type { CropRect, UseCropEngineResult } from "~/hooks/use-crop-engine";

import { ImageStage } from "./image-stage";

/**
 * Viewport の中で zoom 済みの stage を埋める核 component。画像 / mosaic /
 * annotation / hit / selection / preview / crop の各レイヤーを z-order で
 * 重ねる。`useSnapcrop` から `activeTool` などを読むので、Storybook では
 * `SnapcropProvider` で wrap してから render する。
 *
 * 画像本体は SVG data URI のスタブで代用。実 UI 上で見るのが正解の
 * component なので、ここではレイヤー積み重ねの初期状態 (画像 + 選択なし)
 * を確認するに留める。
 *
 * @summary 画像 stage の全レイヤー合成
 */
const meta: Meta<typeof ImageStage> = {
	title: "snapcrop/Canvas/ImageStage",
	component: ImageStage,
	parameters: {
		layout: "padded",
	},
};

export default meta;

type Story = StoryObj<typeof ImageStage>;

const STUB_SRC =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
			<defs>
				<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="#1a0d05"/>
					<stop offset="100%" stop-color="#f47d3a"/>
				</linearGradient>
			</defs>
			<rect width="800" height="600" fill="url(#g)"/>
			<text x="400" y="320" text-anchor="middle" font-family="sans-serif"
				font-size="40" fill="#fff8ec" opacity="0.85">snapcrop stage</text>
		</svg>`,
	);

const STUB_IMAGE: LoadedImage = {
	src: STUB_SRC,
	blob: new Blob(),
	width: 800,
	height: 600,
	format: "image/svg+xml",
	fileSize: 0,
};

function makeCropEngine(cropRect: CropRect | null): UseCropEngineResult {
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
			getImageData: () => ({
				naturalWidth: STUB_IMAGE.width,
				naturalHeight: STUB_IMAGE.height,
			}),
			selectAll: () => {},
			toCanvas: () => document.createElement("canvas"),
			getSourceImage: () => null,
		},
	};
}

function Frame({ zoom }: { zoom: number }) {
	const imgRef = useRef<HTMLImageElement | null>(null);
	const cropEngine = makeCropEngine({
		x: 100,
		y: 80,
		width: 600,
		height: 440,
	});
	return (
		<div
			className="relative overflow-hidden rounded-md border border-border bg-bg-base"
			style={{
				width: STUB_IMAGE.width * zoom,
				height: STUB_IMAGE.height * zoom,
				maxWidth: "100%",
			}}
		>
			<ImageStage
				cropEngine={cropEngine}
				image={STUB_IMAGE}
				imgRef={imgRef}
				zoom={zoom}
			/>
		</div>
	);
}

/**
 * 初期状態 (activeTool = "crop", annotations 空)。SnapcropProvider の初期値で
 * 走るため、CropFrame が rect ありで描画され、annotation / selection 系は空。
 * @summary crop ツール初期表示
 */
export const Default: Story = {
	render: () => (
		<SnapcropProvider>
			<Frame zoom={0.6} />
		</SnapcropProvider>
	),
};

/**
 * `zoom = 1` の等倍表示。stage が大きくなるので、layout: "padded" のキャンバス
 * からはみ出る可能性がある。視覚的にレイヤー積み上げを大きく見たいときに使う。
 * @summary 等倍表示
 */
export const ActualSize: Story = {
	render: () => (
		<SnapcropProvider>
			<Frame zoom={1} />
		</SnapcropProvider>
	),
};
