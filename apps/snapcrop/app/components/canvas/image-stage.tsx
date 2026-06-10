import { type RefObject, useCallback, useEffect, useMemo } from "react";
import { AnnotationLayer } from "~/components/canvas/annotation-layer";
import { CropFrame } from "~/components/canvas/crop-frame";
import { MosaicLayer } from "~/components/canvas/mosaic-layer";
import { RectInteractionLayer } from "~/components/canvas/rect-interaction-layer";
import { RectMiniActions } from "~/components/canvas/rect-mini-actions";
import { RectPreviewOverlay } from "~/components/canvas/rect-preview-overlay";
import { RectSelectionOverlay } from "~/components/canvas/rect-selection-overlay";
import { type LoadedImage, useSnapcrop } from "~/contexts/snapcrop-context";
import type { UseCropEngineResult } from "~/hooks/use-crop-engine";
import { useRectEngine } from "~/hooks/use-rect-engine";
import { duplicateRectAnnotation } from "~/lib/rect-engine";

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
 *   2. <MosaicLayer>                  mosaic スタイルだけを canvas で焼く
 *   3. <AnnotationLayer>              SVG outline / fill
 *   4. <RectInteractionLayer>         activeTool==='rect' のとき、stage 全体の hit
 *                                     (SelectionOverlay の下に置くことで handle
 *                                     クリックを奪わない)
 *   5. <RectSelectionOverlay>         1px ring + 8 handle (handle のみ events:auto)
 *   6. <RectMiniActions>              選択矩形近傍の複製 / 削除バー (interaction 中は非表示)
 *   7. <RectPreviewOverlay>           drawing 中の破線プレビュー
 *   8. <CropFrame>                    activeTool==='crop' のとき
 */
export function ImageStage({
	image,
	zoom,
	cropEngine,
	imgRef,
}: ImageStageProps) {
	const {
		activeTool,
		annotations,
		selectedAnnotationId,
		rectDefaults,
		rectEngineHandleRef,
		createAnnotation,
		deleteAnnotation,
	} = useSnapcrop();

	const imageMetrics = useMemo(
		() => ({ naturalWidth: image.width, naturalHeight: image.height }),
		[image.width, image.height],
	);

	const rectEngine = useRectEngine(imageMetrics);

	// engine の安定ハンドルを context の ref に差し込む。useRectShortcuts と
	// RectInteractionLayer が Esc キャンセル / Space pan 抑制で使う。
	useEffect(() => {
		rectEngineHandleRef.current = rectEngine.handle;
		return () => {
			rectEngineHandleRef.current = null;
		};
	}, [rectEngineHandleRef, rectEngine.handle]);

	// stage 内の座標変換。<img> 要素を基準にして clientX/Y → 画像 px へ。
	// interaction layer と selection overlay 双方で使う。画像ロード前や rect が
	// 取れない状態では null を返し、呼び側で early-return させる
	// (誤って 0,0 を画像座標として扱わないように)。
	const getImagePoint = useCallback(
		(clientX: number, clientY: number): { x: number; y: number } | null => {
			const img = imgRef.current;
			if (!img?.complete || img.naturalWidth === 0) return null;
			const rect = img.getBoundingClientRect();
			if (rect.width <= 0 || rect.height <= 0) return null;
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
			<MosaicLayer
				annotations={rectEngine.renderedAnnotations}
				imageHeight={image.height}
				imageSrc={image.src}
				imageWidth={image.width}
				imgRef={imgRef}
			/>
			<AnnotationLayer
				annotations={rectEngine.renderedAnnotations}
				imageHeight={image.height}
				imageWidth={image.width}
			/>
			{/*
			 * RectInteractionLayer は SelectionOverlay の手前に置くと選択ハンドル
			 * へのクリックが奪われるため、先に配置 (= 視覚的に下) する。本体クリック
			 * は SelectionOverlay の body 側を pointer-events:none にして
			 * InteractionLayer に流す。
			 */}
			{activeTool === "rect" && (
				<RectInteractionLayer
					annotations={annotations}
					engine={rectEngine}
					getImagePoint={getImagePoint}
				/>
			)}
			{selectedRendered && (
				<RectSelectionOverlay
					annotation={selectedRendered}
					engine={rectEngine}
					getImagePoint={getImagePoint}
					zoom={zoom}
				/>
			)}
			{/* ドラッグ・リサイズ中は操作の邪魔になるので隠す */}
			{selectedRendered && !rectEngine.isInteracting && (
				<RectMiniActions
					annotation={selectedRendered}
					imageHeight={image.height}
					imageWidth={image.width}
					onDelete={() => deleteAnnotation(selectedRendered.id)}
					onDuplicate={() =>
						createAnnotation(
							duplicateRectAnnotation(selectedRendered, imageMetrics),
						)
					}
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
		</>
	);
}
