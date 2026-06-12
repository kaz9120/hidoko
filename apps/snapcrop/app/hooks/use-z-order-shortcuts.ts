import { useEffect, useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { useZOrderActions } from "~/hooks/use-z-order";

/**
 * 注釈の重なり順を変えるショートカット (#105):
 *
 *   ]            → 1 段前面へ
 *   [            → 1 段背面へ
 *   ⌘/Ctrl + ]  → 最前面へ
 *   ⌘/Ctrl + [  → 最背面へ
 *
 * 注釈を選択しているときだけ反応する。⌘[ / ⌘] はブラウザの「戻る / 進む」と
 * 重なるため、選択中に限り preventDefault で奪う (非選択時はブラウザ標準の
 * まま)。入力欄 (input / textarea / contenteditable) と IME 入力中は無効化
 * (use-duplicate-shortcut.ts と同じガード)。
 */
export function useZOrderShortcuts() {
	const { image, selectedAnnotationId } = useSnapcrop();
	const zOrder = useZOrderActions();

	// ref で常に最新値を参照 — useEffect の依存を増やさないため
	const imageRef = useRef(image);
	imageRef.current = image;
	const selectedIdRef = useRef(selectedAnnotationId);
	selectedIdRef.current = selectedAnnotationId;
	const zOrderRef = useRef(zOrder);
	zOrderRef.current = zOrder;

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (event.key !== "]" && event.key !== "[") return;
			if (event.shiftKey || event.altKey) return;
			if (event.isComposing || event.keyCode === 229) return;
			if (isInputTarget(event.target)) return;

			const id = selectedIdRef.current;
			if (!imageRef.current || !id) return;
			event.preventDefault();

			const meta = event.metaKey || event.ctrlKey;
			const actions = zOrderRef.current;
			if (event.key === "]") {
				if (meta) {
					actions.bringToFront(id);
				} else {
					actions.bringForward(id);
				}
			} else if (meta) {
				actions.sendToBack(id);
			} else {
				actions.sendBackward(id);
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);
}

function isInputTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	return (
		target.tagName === "INPUT" ||
		target.tagName === "TEXTAREA" ||
		target.isContentEditable
	);
}
