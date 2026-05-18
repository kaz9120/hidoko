import { useEffect, useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { clampRectInImage, MIN_RECT_SIZE } from "~/lib/rect-engine";

/**
 * 矩形ツール用のキーボードショートカット v1 完全版:
 *
 *   R                 → 矩形ツール
 *   V                 → クロップツール
 *   Esc               → 描画中なら破棄、それ以外は選択解除
 *   Backspace/Delete  → 選択中の矩形を削除
 *   ↑↓←→             → 選択中の矩形を 1px nudge (250ms バッチで 1 履歴)
 *   Shift + ↑↓←→     → 10px nudge
 *   Alt   + ↑↓←→     → 右辺 / 下辺リサイズ (←: w-1, →: w+1, ↑: h-1, ↓: h+1)
 *   Space (押下中)    → ドラッグでパンする想定 (別チケット) のため、押下中は
 *                       矩形描画を抑制する
 *
 * 入力欄 (input / textarea / contenteditable) と IME 入力中は全キー無効化。
 * Cmd/Ctrl 修飾は既存ハンドラ (⌘Z 等) と衝突しないよう未捕捉。
 */
export function useRectShortcuts() {
	const {
		image,
		setActiveTool,
		selectAnnotation,
		selectedAnnotationId,
		deleteAnnotation,
		updateAnnotation,
		annotations,
		rectEngineHandleRef,
		spacePressedRef,
	} = useSnapcrop();

	// ref で常に最新値を参照 — useEffect の依存を増やさないため
	const imageRef = useRef(image);
	imageRef.current = image;
	const setActiveToolRef = useRef(setActiveTool);
	setActiveToolRef.current = setActiveTool;
	const selectAnnotationRef = useRef(selectAnnotation);
	selectAnnotationRef.current = selectAnnotation;
	const selectedIdRef = useRef(selectedAnnotationId);
	selectedIdRef.current = selectedAnnotationId;
	const deleteAnnotationRef = useRef(deleteAnnotation);
	deleteAnnotationRef.current = deleteAnnotation;
	const updateAnnotationRef = useRef(updateAnnotation);
	updateAnnotationRef.current = updateAnnotation;
	const annotationsRef = useRef(annotations);
	annotationsRef.current = annotations;
	const engineHandleRef = rectEngineHandleRef;
	const spaceRef = spacePressedRef;

	// Space は keydown / keyup の両方を捕まえてフラグを維持。フォーカスが他に
	// 飛んで keyup を取り逃しても次の keydown で再上書きされる。
	useEffect(() => {
		const onDown = (event: KeyboardEvent) => {
			if (event.code !== "Space") return;
			if (isInputTarget(event.target)) return;
			spaceRef.current = true;
		};
		const onUp = (event: KeyboardEvent) => {
			if (event.code !== "Space") return;
			spaceRef.current = false;
		};
		document.addEventListener("keydown", onDown);
		document.addEventListener("keyup", onUp);
		return () => {
			document.removeEventListener("keydown", onDown);
			document.removeEventListener("keyup", onUp);
		};
	}, [spaceRef]);

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!imageRef.current) return;
			if (event.isComposing || event.keyCode === 229) return;
			if (isInputTarget(event.target)) return;
			// Cmd/Ctrl 系は既存ショートカット (⌘Z など) の領分
			if (event.metaKey || event.ctrlKey) return;

			// R / V — 修飾なし限定
			if (!event.shiftKey && !event.altKey) {
				if (event.key === "r" || event.key === "R") {
					event.preventDefault();
					setActiveToolRef.current("rect");
					return;
				}
				if (event.key === "v" || event.key === "V") {
					event.preventDefault();
					setActiveToolRef.current("crop");
					return;
				}
			}

			if (event.key === "Escape") {
				const eng = engineHandleRef.current;
				if (eng?.isInteracting()) {
					eng.cancelInteraction();
				} else {
					selectAnnotationRef.current(null);
				}
				return;
			}

			if (
				(event.key === "Backspace" || event.key === "Delete") &&
				!event.shiftKey &&
				!event.altKey
			) {
				const id = selectedIdRef.current;
				if (id) {
					event.preventDefault();
					deleteAnnotationRef.current(id);
				}
				return;
			}

			const arrow = parseArrow(event.key);
			if (!arrow) return;
			const id = selectedIdRef.current;
			if (!id) return;
			const target = annotationsRef.current.find((a) => a.id === id);
			if (!target) return;
			const img = imageRef.current;
			if (!img) return;
			event.preventDefault();

			const metrics = { naturalWidth: img.width, naturalHeight: img.height };
			if (event.altKey) {
				// 右辺 / 下辺リサイズ
				const nextW = Math.max(
					MIN_RECT_SIZE,
					Math.min(target.width + arrow.dx, metrics.naturalWidth - target.x),
				);
				const nextH = Math.max(
					MIN_RECT_SIZE,
					Math.min(target.height + arrow.dy, metrics.naturalHeight - target.y),
				);
				updateAnnotationRef.current(
					id,
					{ width: nextW, height: nextH },
					{ batchKey: "nudge-alt" },
				);
				return;
			}
			const step = event.shiftKey ? 10 : 1;
			const clamped = clampRectInImage(
				{
					x: target.x + arrow.dx * step,
					y: target.y + arrow.dy * step,
					width: target.width,
					height: target.height,
				},
				metrics,
			);
			updateAnnotationRef.current(
				id,
				{ x: clamped.x, y: clamped.y },
				{ batchKey: event.shiftKey ? "nudge-shift" : "nudge" },
			);
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [engineHandleRef]);
}

function isInputTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	return (
		target.tagName === "INPUT" ||
		target.tagName === "TEXTAREA" ||
		target.isContentEditable
	);
}

function parseArrow(key: string): { dx: number; dy: number } | null {
	switch (key) {
		case "ArrowLeft":
			return { dx: -1, dy: 0 };
		case "ArrowRight":
			return { dx: 1, dy: 0 };
		case "ArrowUp":
			return { dx: 0, dy: -1 };
		case "ArrowDown":
			return { dx: 0, dy: 1 };
		default:
			return null;
	}
}
