import { type RefObject, useCallback, useEffect, useMemo } from "react";
import { AnnotationLayer } from "~/components/canvas/annotation-layer";
import { ArrowInteractionLayer } from "~/components/canvas/arrow-interaction-layer";
import { ArrowLayer } from "~/components/canvas/arrow-layer";
import { ArrowPreviewOverlay } from "~/components/canvas/arrow-preview-overlay";
import { ArrowSelectionOverlay } from "~/components/canvas/arrow-selection-overlay";
import { CropFrame } from "~/components/canvas/crop-frame";
import { DimensionHud } from "~/components/canvas/dimension-hud";
import { HighlightInteractionLayer } from "~/components/canvas/highlight-interaction-layer";
import { HighlightLayer } from "~/components/canvas/highlight-layer";
import { HighlightPreviewOverlay } from "~/components/canvas/highlight-preview-overlay";
import { HighlightSelectionOverlay } from "~/components/canvas/highlight-selection-overlay";
import { MosaicLayer } from "~/components/canvas/mosaic-layer";
import { RectInteractionLayer } from "~/components/canvas/rect-interaction-layer";
import { RectMiniActions } from "~/components/canvas/rect-mini-actions";
import { RectPreviewOverlay } from "~/components/canvas/rect-preview-overlay";
import { RectSelectionOverlay } from "~/components/canvas/rect-selection-overlay";
import { type LoadedImage, useSnapcrop } from "~/contexts/snapcrop-context";
import { useArrowEngine } from "~/hooks/use-arrow-engine";
import type { UseCropEngineResult } from "~/hooks/use-crop-engine";
import { useHighlightEngine } from "~/hooks/use-highlight-engine";
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
 *   9. <DimensionHud>                 クロップ枠に追従する W × H 表示
 *
 * 矢印ツールのレイヤーも同じ構造で重ねる: <ArrowLayer> は 3 の直上 (矢印は
 * 常に矩形より前)、<ArrowInteractionLayer> / <ArrowSelectionOverlay> /
 * <ArrowPreviewOverlay> は 7 と 8 の間 (activeTool==='arrow' のときだけ)。
 *
 * マーカーツールのレイヤーも同様: <HighlightLayer> は <ArrowLayer> の直上
 * (kind ごとのレイヤー z-order で最前。multiply 合成なので下の矩形・矢印は
 * 透けて見える)、interaction / selection / preview は activeTool==='highlight'
 * のときだけ。
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
		arrows,
		arrowDefaults,
		arrowEngineHandleRef,
		highlights,
		highlightDefaults,
		highlightEngineHandleRef,
		createAnnotation,
		deleteAnnotation,
	} = useSnapcrop();

	const imageMetrics = useMemo(
		() => ({ naturalWidth: image.width, naturalHeight: image.height }),
		[image.width, image.height],
	);

	const rectEngine = useRectEngine(imageMetrics);
	const arrowEngine = useArrowEngine(imageMetrics);
	const highlightEngine = useHighlightEngine(imageMetrics);

	// engine の安定ハンドルを context の ref に差し込む。useRectShortcuts と
	// RectInteractionLayer が Esc キャンセル / Space pan 抑制で使う。
	useEffect(() => {
		rectEngineHandleRef.current = rectEngine.handle;
		return () => {
			rectEngineHandleRef.current = null;
		};
	}, [rectEngineHandleRef, rectEngine.handle]);

	// 矢印 engine も同様。useArrowShortcuts の Esc キャンセルが使う。
	useEffect(() => {
		arrowEngineHandleRef.current = arrowEngine.handle;
		return () => {
			arrowEngineHandleRef.current = null;
		};
	}, [arrowEngineHandleRef, arrowEngine.handle]);

	// マーカー engine も同様。useHighlightShortcuts の Esc キャンセルが使う。
	useEffect(() => {
		highlightEngineHandleRef.current = highlightEngine.handle;
		return () => {
			highlightEngineHandleRef.current = null;
		};
	}, [highlightEngineHandleRef, highlightEngine.handle]);

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

	const selectedArrowRendered =
		selectedAnnotationId && activeTool === "arrow"
			? (arrowEngine.renderedArrows.find(
					(a) => a.id === selectedAnnotationId,
				) ?? null)
			: null;

	const selectedHighlightRendered =
		selectedAnnotationId && activeTool === "highlight"
			? (highlightEngine.renderedHighlights.find(
					(h) => h.id === selectedAnnotationId,
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
			<ArrowLayer
				arrows={arrowEngine.renderedArrows}
				imageHeight={image.height}
				imageWidth={image.width}
			/>
			<HighlightLayer
				highlights={highlightEngine.renderedHighlights}
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
			{activeTool === "arrow" && (
				<ArrowInteractionLayer
					arrows={arrows}
					engine={arrowEngine}
					getImagePoint={getImagePoint}
					zoom={zoom}
				/>
			)}
			{selectedArrowRendered && (
				<ArrowSelectionOverlay
					arrow={selectedArrowRendered}
					engine={arrowEngine}
					getImagePoint={getImagePoint}
					imageHeight={image.height}
					imageWidth={image.width}
					zoom={zoom}
				/>
			)}
			{arrowEngine.previewArrow && activeTool === "arrow" && (
				<ArrowPreviewOverlay
					defaults={arrowDefaults}
					imageHeight={image.height}
					imageWidth={image.width}
					previewArrow={arrowEngine.previewArrow}
				/>
			)}
			{activeTool === "highlight" && (
				<HighlightInteractionLayer
					engine={highlightEngine}
					getImagePoint={getImagePoint}
					highlights={highlights}
					zoom={zoom}
				/>
			)}
			{selectedHighlightRendered && (
				<HighlightSelectionOverlay
					engine={highlightEngine}
					getImagePoint={getImagePoint}
					highlight={selectedHighlightRendered}
					imageHeight={image.height}
					imageWidth={image.width}
					zoom={zoom}
				/>
			)}
			{highlightEngine.previewHighlight && activeTool === "highlight" && (
				<HighlightPreviewOverlay
					defaults={highlightDefaults}
					imageHeight={image.height}
					imageWidth={image.width}
					previewHighlight={highlightEngine.previewHighlight}
				/>
			)}
			{activeTool === "crop" && <CropFrame engine={cropEngine} zoom={zoom} />}
			{activeTool === "crop" && cropEngine.cropRect && (
				<DimensionHud
					imageHeight={image.height}
					imageWidth={image.width}
					rect={cropEngine.cropRect}
					zoom={zoom}
				/>
			)}
		</>
	);
}
