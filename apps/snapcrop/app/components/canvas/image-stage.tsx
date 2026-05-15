import type { RefObject } from "react";
import { CropFrame } from "~/components/canvas/crop-frame";
import type { LoadedImage } from "~/contexts/snapcrop-context";
import type { UseCropEngineResult } from "~/hooks/use-crop-engine";

export type ImageStageProps = {
	image: LoadedImage;
	zoom: number;
	engine: UseCropEngineResult;
	imgRef: RefObject<HTMLImageElement | null>;
};

/**
 * Viewport の中で zoom 済みの stage を埋める薄いレイヤー。画像と CropFrame を
 * 同じ座標系 (stage = imgW × zoom) に並べる。
 */
export function ImageStage({ image, zoom, engine, imgRef }: ImageStageProps) {
	return (
		<>
			<img
				alt="編集中の画像"
				className="pointer-events-none absolute inset-0 block size-full select-none"
				draggable={false}
				ref={imgRef}
				src={image.src}
			/>
			<CropFrame engine={engine} zoom={zoom} />
		</>
	);
}
