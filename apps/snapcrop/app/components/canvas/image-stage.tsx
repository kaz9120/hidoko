import { type RefObject, useCallback, useMemo } from "react";
import { AnnotationLayer } from "~/components/canvas/annotation-layer";
import { CropFrame } from "~/components/canvas/crop-frame";
import { RectInteractionLayer } from "~/components/canvas/rect-interaction-layer";
import { RectPreviewOverlay } from "~/components/canvas/rect-preview-overlay";
import { RectSelectionOverlay } from "~/components/canvas/rect-selection-overlay";
import { type LoadedImage, useSnapcrop } from "~/contexts/snapcrop-context";
import type { UseCropEngineResult } from "~/hooks/use-crop-engine";
import { useRectEngine } from "~/hooks/use-rect-engine";

export type ImageStageProps = {
	image: LoadedImage;
	zoom: number;
	cropEngine: UseCropEngineResult;
	imgRef: RefObject<HTMLImageElement | null>;
};

/**
 * Viewport の中で zoom 済みの stage を埋める薄いレイヤー。画像と各種編集
 * オーバーレイ (crop, annotation, selection, preview, hit-test) を同じ stage 内に
 * z-order で重ねる。
 *
 * z-order (上に行くほど前):
 *   1. <img>                          画像本体 (pointer-events:none)
 *   2. <AnnotationLayer>              SVG outline / fill (mosaic は Step 5)
 *   3. <RectSelectionOverlay>         1px ring + 8 handle (handle のみ events:auto)
 *   4. <RectPreviewOverlay>           drawing 中の破線プレビュー
 *   5. <CropFrame>                    activeTool==='crop' のとき
 *   6. <RectInteractionLayer>         activeTool==='rect' のとき、stage 全体の hit
 */
export function ImageStage({
	image,
	zoom,
	cropEngine,
	imgRef,
}: ImageStageProps) {
	const { activeTool, annotations, selectedAnnotationId, rectDefaults } =
		useSnapcrop();

	const imageMetrics = useMemo(
		() => ({ naturalWidth: image.width, naturalHeight: image.height }),
		[image.width, image.height],
	);

	const rectEngine = useRectEngine(imageMetrics);

	// stage 内の座標変換。<img> 要素を基準にして clientX/Y → 画像 px へ。
	// interaction layer と selection overlay 双方で使う。
	const getImagePoint = useCallback(
		(clientX: number, clientY: number) => {
			const img = imgRef.current;
			if (!img) return { x: 0, y: 0 };
			const rect = img.getBoundingClientRect();
			return {
				x: (clientX - rect.left) / zoom,
				y: (clientY - rect.top) / zoom,
			};
		},
		[imgRef, zoom],
	);

	const selectedRendered =
		selectedAnnotationId && activeTool === "rect"
			? (rectEngine.renderedAnnotations.find(
					(a) => a.id === selectedAnnotationId,
				) ?? null)
			: null;

	return (
		<>
			<img
				alt="編集中の画像"
				className="pointer-events-none absolute inset-0 block size-full select-none"
				draggable={false}
				ref={imgRef}
				src={image.src}
			/>
			<AnnotationLayer
				annotations={rectEngine.renderedAnnotations}
				imageHeight={image.height}
				imageWidth={image.width}
			/>
			{selectedRendered && (
				<RectSelectionOverlay
					annotation={selectedRendered}
					engine={rectEngine}
					getImagePoint={getImagePoint}
					zoom={zoom}
				/>
			)}
			{rectEngine.previewRect && activeTool === "rect" && (
				<RectPreviewOverlay
					color={rectDefaults.color}
					imageHeight={image.height}
					imageWidth={image.width}
					previewRect={rectEngine.previewRect}
					thickness={rectDefaults.thickness}
				/>
			)}
			{activeTool === "crop" && <CropFrame engine={cropEngine} zoom={zoom} />}
			{activeTool === "rect" && (
				<RectInteractionLayer
					annotations={annotations}
					engine={rectEngine}
					getImagePoint={getImagePoint}
				/>
			)}
		</>
	);
}
