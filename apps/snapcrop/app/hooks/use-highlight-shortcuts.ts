import { useEffect, useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { moveHighlight } from "~/lib/highlight-engine";

/**
 * マーカーツール用のキーボードショートカット。use-arrow-shortcuts.ts の先例に
 * 揃える:
 *
 *   H                 → マーカーツール
 *   Esc               → 描画 / ドラッグ中なら破棄 (選択解除は rect 側 Esc が共通処理)
 *   Backspace/Delete  → 選択中のハイライトを削除
 *   ↑↓←→             → 選択中のハイライトを 1px nudge (250ms バッチで 1 履歴)
 *   Shift + ↑↓←→     → 10px nudge
 *
 * 入力欄 (input / textarea / contenteditable) と IME 入力中は全キー無効化。
 * Cmd/Ctrl 修飾は既存ハンドラ (⌘Z / ⌘A / ⌘C 等) と衝突しないよう未捕捉。
 * 選択 id は全 kind 共有なので、ハイライトに該当しない id では何もしない
 * (rect / arrow 側のハンドラが処理する)。
 */
export function useHighlightShortcuts() {
	const {
		image,
		setActiveTool,
		selectedAnnotationId,
		deleteHighlight,
		updateHighlight,
		highlights,
		highlightEngineHandleRef,
	} = useSnapcrop();

	// ref で常に最新値を参照 — useEffect の依存を増やさないため
	const imageRef = useRef(image);
	imageRef.current = image;
	const setActiveToolRef = useRef(setActiveTool);
	setActiveToolRef.current = setActiveTool;
	const selectedIdRef = useRef(selectedAnnotationId);
	selectedIdRef.current = selectedAnnotationId;
	const deleteHighlightRef = useRef(deleteHighlight);
	deleteHighlightRef.current = deleteHighlight;
	const updateHighlightRef = useRef(updateHighlight);
	updateHighlightRef.current = updateHighlight;
	const highlightsRef = useRef(highlights);
	highlightsRef.current = highlights;
	const engineHandleRef = highlightEngineHandleRef;

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!imageRef.current) return;
			if (event.isComposing || event.keyCode === 229) return;
			if (isInputTarget(event.target)) return;
			// Cmd/Ctrl 系は既存ショートカット (⌘A 全選択など) の領分
			if (event.metaKey || event.ctrlKey) return;

			// H — 修飾なし限定
			if (!event.shiftKey && !event.altKey) {
				if (event.key === "h" || event.key === "H") {
					event.preventDefault();
					setActiveToolRef.current("highlight");
					return;
				}
			}

			if (event.key === "Escape") {
				const eng = engineHandleRef.current;
				if (eng?.isInteracting()) {
					eng.cancelInteraction();
				}
				// 選択解除は use-rect-shortcuts の Esc が共通で行う
				return;
			}

			if (
				(event.key === "Backspace" || event.key === "Delete") &&
				!event.shiftKey &&
				!event.altKey
			) {
				const id = selectedIdRef.current;
				if (id && highlightsRef.current.some((h) => h.id === id)) {
					event.preventDefault();
					deleteHighlightRef.current(id);
				}
				return;
			}

			const arrowKey = parseArrowKey(event.key);
			if (!arrowKey || event.altKey) return;
			const id = selectedIdRef.current;
			if (!id) return;
			const target = highlightsRef.current.find((h) => h.id === id);
			if (!target) return;
			const img = imageRef.current;
			if (!img) return;
			event.preventDefault();

			const metrics = { naturalWidth: img.width, naturalHeight: img.height };
			const step = event.shiftKey ? 10 : 1;
			const moved = moveHighlight(
				target,
				{ dx: arrowKey.dx * step, dy: arrowKey.dy * step },
				metrics,
			);
			updateHighlightRef.current(
				id,
				{ x1: moved.x1, y1: moved.y1, x2: moved.x2, y2: moved.y2 },
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

function parseArrowKey(key: string): { dx: number; dy: number } | null {
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
