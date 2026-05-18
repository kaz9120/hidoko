import { useEffect, useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";

/**
 * 矩形ツール用のキーボードショートカット。Step2 では R/V/Esc のみ。
 * Step3 以降で Backspace/Delete (削除) と矢印 (nudge) を追加する。
 *
 * 入力欄 (input / textarea / contenteditable) と IME 入力中は無効化する。
 * Cmd/Ctrl 等の修飾キー単独の組合せは既存ハンドラ (⌘Z 等) と衝突しないよう
 * 修飾なしの単独キーだけを判定する。
 */
export function useRectShortcuts() {
	const { image, setActiveTool, selectAnnotation } = useSnapcrop();

	const imageRef = useRef(image);
	imageRef.current = image;
	const setActiveToolRef = useRef(setActiveTool);
	setActiveToolRef.current = setActiveTool;
	const selectAnnotationRef = useRef(selectAnnotation);
	selectAnnotationRef.current = selectAnnotation;

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
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);
}
