import { useEffect, useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { moveText } from "~/lib/text-engine";

/**
 * テキストツール用のキーボードショートカット。use-arrow-shortcuts.ts の先例に
 * 揃える:
 *
 *   T                 → テキストツール
 *   Esc               → 移動ドラッグ中なら破棄 (選択解除は rect 側 Esc が共通処理)
 *   Backspace/Delete  → 選択中のテキストを削除
 *   ↑↓←→             → 選択中のテキストを 1px nudge (250ms バッチで 1 履歴)
 *   Shift + ↑↓←→     → 10px nudge
 *
 * 入力欄 (input / textarea / contenteditable) と IME 入力中は全キー無効化。
 * インライン編集中はフォーカスが textarea にあるため、この入力欄ガードで
 * ツールショートカット類は一切発火しない (編集中の Esc / 確定は
 * TextEditorOverlay 自身が処理する)。選択 id は rect / arrow と共有なので、
 * テキストに該当しない id では何もしない。
 */
export function useTextShortcuts() {
	const {
		image,
		setActiveTool,
		selectedAnnotationId,
		deleteText,
		updateText,
		texts,
		textEngineHandleRef,
	} = useSnapcrop();

	// ref で常に最新値を参照 — useEffect の依存を増やさないため
	const imageRef = useRef(image);
	imageRef.current = image;
	const setActiveToolRef = useRef(setActiveTool);
	setActiveToolRef.current = setActiveTool;
	const selectedIdRef = useRef(selectedAnnotationId);
	selectedIdRef.current = selectedAnnotationId;
	const deleteTextRef = useRef(deleteText);
	deleteTextRef.current = deleteText;
	const updateTextRef = useRef(updateText);
	updateTextRef.current = updateText;
	const textsRef = useRef(texts);
	textsRef.current = texts;
	const engineHandleRef = textEngineHandleRef;

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!imageRef.current) return;
			if (event.isComposing || event.keyCode === 229) return;
			if (isInputTarget(event.target)) return;
			// Cmd/Ctrl 系は既存ショートカット (⌘A 全選択など) の領分
			if (event.metaKey || event.ctrlKey) return;

			// T — 修飾なし限定
			if (!event.shiftKey && !event.altKey) {
				if (event.key === "t" || event.key === "T") {
					event.preventDefault();
					setActiveToolRef.current("text");
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
				if (id && textsRef.current.some((t) => t.id === id)) {
					event.preventDefault();
					deleteTextRef.current(id);
				}
				return;
			}

			const arrowKey = parseArrowKey(event.key);
			if (!arrowKey || event.altKey) return;
			const id = selectedIdRef.current;
			if (!id) return;
			const target = textsRef.current.find((t) => t.id === id);
			if (!target) return;
			const img = imageRef.current;
			if (!img) return;
			event.preventDefault();

			const metrics = { naturalWidth: img.width, naturalHeight: img.height };
			const step = event.shiftKey ? 10 : 1;
			const moved = moveText(
				target,
				{ dx: arrowKey.dx * step, dy: arrowKey.dy * step },
				metrics,
			);
			updateTextRef.current(
				id,
				{ x: moved.x, y: moved.y },
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
