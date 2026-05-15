import { useEffect, useRef } from "react";
import type { CropEngineHandle } from "~/hooks/use-crop-engine";

type Options = {
	cropperRef: React.RefObject<CropEngineHandle | null>;
	hasImage: boolean;
};

/**
 * Cmd/Ctrl+A でクロップ範囲を画像全体に広げるショートカット。
 *
 * 入力欄上やテキスト選択中はブラウザ標準の全選択を優先する。
 */
export function useSelectAllShortcut({ cropperRef, hasImage }: Options) {
	const cropperRefRef = useRef(cropperRef);
	cropperRefRef.current = cropperRef;
	const hasImageRef = useRef(hasImage);
	hasImageRef.current = hasImage;

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey)) {
				return;
			}
			if (event.key !== "a" && event.key !== "A") {
				return;
			}
			if (!hasImageRef.current) {
				return;
			}
			const cropper = cropperRefRef.current.current;
			if (!cropper) {
				return;
			}

			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.tagName === "SELECT" ||
					target.isContentEditable)
			) {
				return;
			}

			// テキスト選択中は通常の全選択を優先
			if (window.getSelection()?.toString()) {
				return;
			}

			event.preventDefault();
			cropper.selectAll();
		};

		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);
}
