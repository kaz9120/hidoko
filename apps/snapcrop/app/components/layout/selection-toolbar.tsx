import { useMemo } from "react";
import { ArrowFloatingToolbar } from "~/components/canvas/arrow-floating-toolbar";
import { CropFloatingToolbar } from "~/components/canvas/crop-floating-toolbar";
import { HighlightFloatingToolbar } from "~/components/canvas/highlight-floating-toolbar";
import { RectFloatingToolbar } from "~/components/canvas/rect-floating-toolbar";
import { TextFloatingToolbar } from "~/components/canvas/text-floating-toolbar";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { useDuplicateAnnotation } from "~/hooks/use-duplicate-annotation";
import { useZOrderActions } from "~/hooks/use-z-order";
import { sortAnnotationsByZ } from "~/lib/annotation-z-order";

/**
 * 描画領域の上部中央に固定で出るバーの選択ハンドラ。
 *
 * 旧バージョンでは bbox 上辺貼り付き + 各 FloatingToolbar を image-stage 内に
 * 直接描画していたが、上部固定に統一したため editor-canvas の viewport の
 * 兄弟 (= scroll しないコンテナ) で 1 箇所にまとめる。
 *
 * 出し分け:
 *   - activeTool === 'crop'      クロップ HUD (枠が存在するときのみ)
 *   - 矩形 / 矢印 / テキスト / マーカー選択中  種別ごとの HUD
 *   - それ以外                    何も描画しない
 */
export function SelectionToolbar() {
	const {
		activeTool,
		image,
		annotations,
		arrows,
		texts,
		highlights,
		selectedAnnotationId,
		updateAnnotation,
		deleteAnnotation,
		updateArrow,
		deleteArrow,
		updateText,
		deleteText,
		updateHighlight,
		deleteHighlight,
		cropperRef,
		cropData,
		cropAspectRatioId,
		setCropAspectRatioId,
		cropIsPortrait,
		setCropIsPortrait,
	} = useSnapcrop();
	const duplicate = useDuplicateAnnotation();
	const zOrderActions = useZOrderActions();

	const imageMetrics = useMemo(
		() => ({
			naturalWidth: image?.width ?? 0,
			naturalHeight: image?.height ?? 0,
		}),
		[image?.width, image?.height],
	);

	// z 操作ボタンの活性判定。選択中の注釈が前後どこまで移動できるかを
	// 全種別合流リストでの位置から決める (canvas/image-stage と同じロジック)。
	const zOrdered = useMemo(
		() => sortAnnotationsByZ({ annotations, arrows, texts, highlights }),
		[annotations, arrows, texts, highlights],
	);

	if (!image) return null;

	// crop モードは選択中の注釈がなくても出す (枠は必ず存在する)
	if (activeTool === "crop") {
		if (!cropData) return null;
		return (
			<CropFloatingToolbar
				aspectRatioId={cropAspectRatioId}
				cropRect={cropData}
				cropperRef={cropperRef}
				isPortrait={cropIsPortrait}
				onAspectRatioIdChange={setCropAspectRatioId}
				onPortraitChange={setCropIsPortrait}
			/>
		);
	}

	if (!selectedAnnotationId) return null;

	const selectedZ = zOrdered.findIndex((a) => a.id === selectedAnnotationId);
	const canBringForward = selectedZ >= 0 && selectedZ < zOrdered.length - 1;
	const canSendBackward = selectedZ > 0;

	const rect = annotations.find((a) => a.id === selectedAnnotationId);
	if (rect) {
		return (
			<RectFloatingToolbar
				canBringForward={canBringForward}
				canSendBackward={canSendBackward}
				onBringForward={() => zOrderActions.bringForward(rect.id)}
				onDelete={() => deleteAnnotation(rect.id)}
				onDuplicate={() => duplicate(rect, imageMetrics)}
				onSendBackward={() => zOrderActions.sendBackward(rect.id)}
				onThicknessChange={(thickness) =>
					updateAnnotation(rect.id, { thickness })
				}
				rect={rect}
			/>
		);
	}

	const arrow = arrows.find((a) => a.id === selectedAnnotationId);
	if (arrow) {
		return (
			<ArrowFloatingToolbar
				arrow={arrow}
				canBringForward={canBringForward}
				canSendBackward={canSendBackward}
				onBringForward={() => zOrderActions.bringForward(arrow.id)}
				onDelete={() => deleteArrow(arrow.id)}
				onDuplicate={() => duplicate(arrow, imageMetrics)}
				onSendBackward={() => zOrderActions.sendBackward(arrow.id)}
				onThicknessChange={(thickness) => updateArrow(arrow.id, { thickness })}
			/>
		);
	}

	const text = texts.find((t) => t.id === selectedAnnotationId);
	if (text) {
		return (
			<TextFloatingToolbar
				canBringForward={canBringForward}
				canSendBackward={canSendBackward}
				onAlignChange={(align) => updateText(text.id, { align })}
				onBoldToggle={(bold) => updateText(text.id, { bold })}
				onBringForward={() => zOrderActions.bringForward(text.id)}
				onDelete={() => deleteText(text.id)}
				onDuplicate={() => duplicate(text, imageMetrics)}
				onItalicToggle={(italic) => updateText(text.id, { italic })}
				onSendBackward={() => zOrderActions.sendBackward(text.id)}
				text={text}
			/>
		);
	}

	const highlight = highlights.find((h) => h.id === selectedAnnotationId);
	if (highlight) {
		return (
			<HighlightFloatingToolbar
				canBringForward={canBringForward}
				canSendBackward={canSendBackward}
				highlight={highlight}
				onBringForward={() => zOrderActions.bringForward(highlight.id)}
				onDelete={() => deleteHighlight(highlight.id)}
				onDuplicate={() => duplicate(highlight, imageMetrics)}
				onSendBackward={() => zOrderActions.sendBackward(highlight.id)}
				onThicknessChange={(thickness) =>
					updateHighlight(highlight.id, { thickness })
				}
			/>
		);
	}

	return null;
}
