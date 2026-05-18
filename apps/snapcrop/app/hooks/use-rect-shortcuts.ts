import { useEffect, useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";

/**
 * 矩形ツール用のキーボードショートカット。Step3 時点では:
 *   R                 → 矩形ツール
 *   V                 → クロップツール (= 既存ツール)
 *   Esc               → 選択解除
 *   Backspace/Delete  → 選択中の矩形を削除
 *
 * Esc 中の描画キャンセル / 矢印 nudge / Space pan 抑制は Step 6 で追加する。
 *
 * 入力欄 (input / textarea / contenteditable) と IME 入力中は無効化する。
 * Cmd/Ctrl/Alt 修飾は既存ハンドラ (⌘Z 等) と衝突しないよう修飾なしの単独キーだけを判定する。
 */
export function useRectShortcuts() {
	const {
		image,
		setActiveTool,
		selectAnnotation,
		selectedAnnotationId,
		deleteAnnotation,
	} = useSnapcrop();

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

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!imageRef.current) return;
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (event.isComposing || event.keyCode === 229) return;

			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			if (event.key === "r" || event.key === "R") {
				event.preventDefault();
				setActiveToolRef.current("rect");
			} else if (event.key === "v" || event.key === "V") {
				event.preventDefault();
				setActiveToolRef.current("crop");
			} else if (event.key === "Escape") {
				selectAnnotationRef.current(null);
			} else if (event.key === "Backspace" || event.key === "Delete") {
				const id = selectedIdRef.current;
				if (id) {
					event.preventDefault();
					deleteAnnotationRef.current(id);
				}
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);
}
