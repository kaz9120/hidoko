import {
	Fragment,
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
} from "react";
import { AnnotationInteractionLayer } from "~/components/canvas/annotation-interaction-layer";
import { AnnotationLayer } from "~/components/canvas/annotation-layer";
import { ArrowFloatingToolbar } from "~/components/canvas/arrow-floating-toolbar";
import { ArrowLayer } from "~/components/canvas/arrow-layer";
import { ArrowPreviewOverlay } from "~/components/canvas/arrow-preview-overlay";
import { ArrowSelectionOverlay } from "~/components/canvas/arrow-selection-overlay";
import { CropFrame } from "~/components/canvas/crop-frame";
import { DimensionHud } from "~/components/canvas/dimension-hud";
import { HighlightLayer } from "~/components/canvas/highlight-layer";
import { HighlightPreviewOverlay } from "~/components/canvas/highlight-preview-overlay";
import { HighlightSelectionOverlay } from "~/components/canvas/highlight-selection-overlay";
import { MosaicLayer } from "~/components/canvas/mosaic-layer";
import { RectPreviewOverlay } from "~/components/canvas/rect-preview-overlay";
import { RectSelectionOverlay } from "~/components/canvas/rect-selection-overlay";
import { TextEditorOverlay } from "~/components/canvas/text-editor-overlay";
import { TextLayer } from "~/components/canvas/text-layer";
import { TextSelectionOverlay } from "~/components/canvas/text-selection-overlay";
import { type LoadedImage, useSnapcrop } from "~/contexts/snapcrop-context";
import { useArrowEngine } from "~/hooks/use-arrow-engine";
import type { UseCropEngineResult } from "~/hooks/use-crop-engine";
import { useHighlightEngine } from "~/hooks/use-highlight-engine";
import { useRectEngine } from "~/hooks/use-rect-engine";
import { useTextEngine } from "~/hooks/use-text-engine";
import {
	groupAnnotationRuns,
	sortAnnotationsByZ,
} from "~/lib/annotation-z-order";

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
 *   2. 注釈レイヤー群                  全種別を zIndex 順 (annotation-z-order.ts)
 *                                     に合流し、同種別が連続する区間 (run) ごと
 *                                     に既存レイヤーを積む。z 操作をしていない
 *                                     ドキュメントでは従来どおり
 *                                     MosaicLayer → AnnotationLayer →
 *                                     ArrowLayer → TextLayer → HighlightLayer
 *                                     の 1 区間ずつになる。rect 区間内では
 *                                     mosaic を canvas で下に、outline / fill
 *                                     を SVG で上に重ねる (従来の v1 簡略化を
 *                                     区間内で維持)
 *   7. <AnnotationInteractionLayer>   描画系ツール (crop 以外) のとき、stage
 *                                     全体の hit。全種別横断の hit test (#103)
 *                                     を行う (SelectionOverlay の下に置くことで
 *                                     handle クリックを奪わない)
 *   8. 各種 SelectionOverlay          選択中の注釈の種別に応じて 1 つだけ表示
 *                                     (ring + handle。handle のみ events:auto)
 *   9. 各種 FloatingToolbar           選択中の注釈に貼り付くフローティング
 *                                     ツールバー (#147 Phase 3)。種別固有の編集
 *                                     UI + 共通アクション (複製・z 順・削除) を
 *                                     持つ。interaction 中とテキストのインライン
 *                                     編集中は非表示
 *  10. 各種 PreviewOverlay            drawing 中のプレビュー (activeTool のものだけ)。
 *                                     テキストは preview の代わりにインライン編集の
 *                                     <TextEditorOverlay> が「まだ commit されて
 *                                     いない状態」を担う
 *  11. <CropFrame>                    activeTool==='crop' のとき
 *  12. <DimensionHud>                 クロップ枠に追従する W × H 表示
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
		texts,
		textDefaults,
		textEngineHandleRef,
		highlights,
		highlightDefaults,
		highlightEngineHandleRef,
	} = useSnapcrop();

	const imageMetrics = useMemo(
		() => ({ naturalWidth: image.width, naturalHeight: image.height }),
		[image.width, image.height],
	);

	const rectEngine = useRectEngine(imageMetrics);
	const arrowEngine = useArrowEngine(imageMetrics);
	const textEngine = useTextEngine(imageMetrics);
	const highlightEngine = useHighlightEngine(imageMetrics);

	// engine の安定ハンドルを context の ref に差し込む。useRectShortcuts と
	// AnnotationInteractionLayer が Esc キャンセル / Space pan 抑制で使う。
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

	// テキスト engine も同様。useTextShortcuts の Esc キャンセルと、
	// use-rect-shortcuts の「編集中は選択解除しない」判定が使う。
	useEffect(() => {
		textEngineHandleRef.current = textEngine.handle;
		return () => {
			textEngineHandleRef.current = null;
		};
	}, [textEngineHandleRef, textEngine.handle]);

	// マーカー engine も同様。useHighlightShortcuts の Esc キャンセルが使う。
	useEffect(() => {
		highlightEngineHandleRef.current = highlightEngine.handle;
		return () => {
			highlightEngineHandleRef.current = null;
		};
	}, [highlightEngineHandleRef, highlightEngine.handle]);

	// 全種別を zIndex 順に合流し、同種別の連続区間 (run) ごとにレイヤーを積む。
	// ドラッグ中は engine の rendered* (live 値) を使うが、zIndex は interaction
	// で変わらないので並びは安定している。
	const zOrdered = useMemo(
		() =>
			sortAnnotationsByZ({
				annotations: rectEngine.renderedAnnotations,
				arrows: arrowEngine.renderedArrows,
				texts: textEngine.renderedTexts,
				highlights: highlightEngine.renderedHighlights,
			}),
		[
			rectEngine.renderedAnnotations,
			arrowEngine.renderedArrows,
			textEngine.renderedTexts,
			highlightEngine.renderedHighlights,
		],
	);
	const zRuns = useMemo(() => groupAnnotationRuns(zOrdered), [zOrdered]);

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

	// 選択 overlay の出し分けは activeTool でなくデータ駆動 — 選択 id がどの
	// 種別のリストにあるかで決める。クロス選択 (#103) では activeTool が選択
	// 種別へ追従するが、表示自体を activeTool に依存させない方が頑健。
	// (id は全種別を通して一意なので、最大 1 つしかヒットしない)
	const selectedRendered = selectedAnnotationId
		? (rectEngine.renderedAnnotations.find(
				(a) => a.id === selectedAnnotationId,
			) ?? null)
		: null;

	const selectedArrowRendered = selectedAnnotationId
		? (arrowEngine.renderedArrows.find((a) => a.id === selectedAnnotationId) ??
			null)
		: null;

	const selectedTextRendered = selectedAnnotationId
		? (textEngine.renderedTexts.find((t) => t.id === selectedAnnotationId) ??
			null)
		: null;

	const selectedHighlightRendered = selectedAnnotationId
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
			{zRuns.map((run, i) => {
				// run の分割は z 操作時にしか変わらないので index キーで十分
				const key = `${run.kind}-${i}`;
				switch (run.kind) {
					case "rect":
						return (
							<Fragment key={key}>
								{run.items.some((a) => a.style === "mosaic") && (
									<MosaicLayer
										annotations={run.items}
										imageHeight={image.height}
										imageSrc={image.src}
										imageWidth={image.width}
										imgRef={imgRef}
									/>
								)}
								<AnnotationLayer
									annotations={run.items}
									imageHeight={image.height}
									imageWidth={image.width}
								/>
							</Fragment>
						);
					case "arrow":
						return (
							<ArrowLayer
								arrows={run.items}
								imageHeight={image.height}
								imageWidth={image.width}
								key={key}
							/>
						);
					case "text":
						return (
							<TextLayer
								editingId={textEngine.editing?.id ?? null}
								imageHeight={image.height}
								imageWidth={image.width}
								key={key}
								texts={run.items}
							/>
						);
					case "highlight":
						return (
							<HighlightLayer
								highlights={run.items}
								imageHeight={image.height}
								imageWidth={image.width}
								key={key}
							/>
						);
					default:
						return null;
				}
			})}
			{/*
			 * AnnotationInteractionLayer は SelectionOverlay の手前に置くと選択
			 * ハンドルへのクリックが奪われるため、先に配置 (= 視覚的に下) する。
			 * 本体クリックは SelectionOverlay の body 側を pointer-events:none に
			 * して InteractionLayer に流す。
			 */}
			{activeTool !== "crop" && (
				<AnnotationInteractionLayer
					activeTool={activeTool}
					annotations={annotations}
					arrowEngine={arrowEngine}
					arrows={arrows}
					getImagePoint={getImagePoint}
					highlightEngine={highlightEngine}
					highlights={highlights}
					rectEngine={rectEngine}
					textEngine={textEngine}
					texts={texts}
					zoom={zoom}
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
			{rectEngine.previewRect &&
				(activeTool === "rect" || activeTool === "mosaic") && (
					<RectPreviewOverlay
						color={rectDefaults.color}
						imageHeight={image.height}
						imageWidth={image.width}
						previewRect={rectEngine.previewRect}
						thickness={rectDefaults.thickness}
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
			{selectedTextRendered &&
				textEngine.editing?.id !== selectedTextRendered.id && (
					<TextSelectionOverlay text={selectedTextRendered} zoom={zoom} />
				)}
			{activeTool === "text" && textEngine.editing && (
				<TextEditorOverlay
					defaults={textDefaults}
					editing={textEngine.editing}
					key={textEngine.editing.id ?? "new"}
					onCancel={textEngine.cancelEdit}
					onCommit={textEngine.commitEdit}
					registerFlush={textEngine.registerEditorFlush}
					texts={texts}
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
