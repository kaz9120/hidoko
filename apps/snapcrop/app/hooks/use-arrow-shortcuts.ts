import { useEffect, useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { moveArrow } from "~/lib/arrow-engine";

/**
 * 矢印ツール用のキーボードショートカット。use-rect-shortcuts.ts の先例に揃える:
 *
 *   A                 → 矢印ツール (⌘A は全選択の領分なので modifier 付きは無視)
 *   Esc               → 描画 / ドラッグ中なら破棄 (選択解除は rect 側 Esc が共通処理)
 *   Backspace/Delete  → 選択中の矢印を削除
 *   ↑↓←→             → 選択中の矢印を 1px nudge (250ms バッチで 1 履歴)
 *   Shift + ↑↓←→     → 10px nudge
 *
 * 入力欄 (input / textarea / contenteditable) と IME 入力中は全キー無効化。
 * Cmd/Ctrl 修飾は既存ハンドラ (⌘Z / ⌘A / ⌘C 等) と衝突しないよう未捕捉。
 * 選択 id は rect と共有なので、矢印に該当しない id では何もしない
 * (rect 側のハンドラが処理する)。
 */
export function useArrowShortcuts() {
	const {
		image,
		setActiveTool,
		selectedAnnotationId,
		deleteArrow,
		updateArrow,
		arrows,
		arrowEngineHandleRef,
	} = useSnapcrop();

	// ref で常に最新値を参照 — useEffect の依存を増やさないため
	const imageRef = useRef(image);
	imageRef.current = image;
	const setActiveToolRef = useRef(setActiveTool);
	setActiveToolRef.current = setActiveTool;
	const selectedIdRef = useRef(selectedAnnotationId);
	selectedIdRef.current = selectedAnnotationId;
	const deleteArrowRef = useRef(deleteArrow);
	deleteArrowRef.current = deleteArrow;
	const updateArrowRef = useRef(updateArrow);
	updateArrowRef.current = updateArrow;
	const arrowsRef = useRef(arrows);
	arrowsRef.current = arrows;
	const engineHandleRef = arrowEngineHandleRef;

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!imageRef.current) return;
			if (event.isComposing || event.keyCode === 229) return;
			if (isInputTarget(event.target)) return;
			// Cmd/Ctrl 系は既存ショートカット (⌘A 全選択など) の領分
			if (event.metaKey || event.ctrlKey) return;

			// A — 修飾なし限定
			if (!event.shiftKey && !event.altKey) {
				if (event.key === "a" || event.key === "A") {
					event.preventDefault();
					setActiveToolRef.current("arrow");
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
				if (id && arrowsRef.current.some((a) => a.id === id)) {
					event.preventDefault();
					deleteArrowRef.current(id);
				}
				return;
			}

			const arrowKey = parseArrowKey(event.key);
			if (!arrowKey || event.altKey) return;
			const id = selectedIdRef.current;
			if (!id) return;
			const target = arrowsRef.current.find((a) => a.id === id);
			if (!target) return;
			const img = imageRef.current;
			if (!img) return;
			event.preventDefault();

			const metrics = { naturalWidth: img.width, naturalHeight: img.height };
			const step = event.shiftKey ? 10 : 1;
			const moved = moveArrow(
				target,
				{ dx: arrowKey.dx * step, dy: arrowKey.dy * step },
				metrics,
			);
			updateArrowRef.current(
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
