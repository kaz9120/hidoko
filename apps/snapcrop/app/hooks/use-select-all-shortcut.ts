import { useEffect, useRef } from "react";
import type { CropEngineHandle } from "~/hooks/use-crop-engine";

type Options = {
	cropperRef: React.RefObject<CropEngineHandle | null>;
	/** クロップ枠を編集中のときだけ true。確定後は枠を動かせない。 */
	enabled: boolean;
};

/**
 * Cmd/Ctrl+A でクロップ範囲を画像全体に広げるショートカット。
 *
 * 枠を編集している間だけ効く。確定後にも効かせると、画面に映っている範囲と
 * 書き出す範囲が黙ってずれてしまう。
 *
 * 入力欄上やテキスト選択中はブラウザ標準の全選択を優先する。
 */
export function useSelectAllShortcut({ cropperRef, enabled }: Options) {
	const cropperRefRef = useRef(cropperRef);
	cropperRefRef.current = cropperRef;
	const enabledRef = useRef(enabled);
	enabledRef.current = enabled;

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey)) {
				return;
			}
			if (event.key !== "a" && event.key !== "A") {
				return;
			}
			if (!enabledRef.current) {
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
