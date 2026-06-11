import { useEffect, useRef } from "react";
import type { CropEngineHandle } from "~/hooks/use-crop-engine";
import type { ArrowAnnotation } from "~/lib/arrow-engine";
import { writeImageToClipboard } from "~/lib/clipboard";
import { getCroppedBlob } from "~/lib/image-export";
import type { RectAnnotation } from "~/lib/rect-engine";

type Options = {
	cropperRef: React.RefObject<CropEngineHandle | null>;
	hasImage: boolean;
	annotations: readonly RectAnnotation[];
	arrows: readonly ArrowAnnotation[];
	onSuccess: () => void;
	onFailure: () => void;
};

/**
 * Cmd/Ctrl+C でクロップ済み画像をクリップボードにコピーするショートカット。
 *
 * 標準のコピー動作 (テキスト選択コピー) と競合しないよう、以下の場合は
 * preventDefault せず通常処理に委ねる:
 * - 画像が未ロード
 * - 入力欄 (input / textarea / contenteditable) 上で押された
 * - ユーザーがテキストを選択中
 */
export function useCopyShortcut({
	cropperRef,
	hasImage,
	annotations,
	arrows,
	onSuccess,
	onFailure,
}: Options) {
	const cropperRefRef = useRef(cropperRef);
	cropperRefRef.current = cropperRef;
	const hasImageRef = useRef(hasImage);
	hasImageRef.current = hasImage;
	const annotationsRef = useRef(annotations);
	annotationsRef.current = annotations;
	const arrowsRef = useRef(arrows);
	arrowsRef.current = arrows;
	const onSuccessRef = useRef(onSuccess);
	onSuccessRef.current = onSuccess;
	const onFailureRef = useRef(onFailure);
	onFailureRef.current = onFailure;

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey)) {
				return;
			}
			if (event.key !== "c" && event.key !== "C") {
				return;
			}
			if (!hasImageRef.current) {
				return;
			}
			const cropper = cropperRefRef.current.current;
			if (!cropper) {
				return;
			}

			// 入力欄上は通常のコピーを優先
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			// テキスト選択中は通常のコピーを優先
			if (window.getSelection()?.toString()) {
				return;
			}

			event.preventDefault();
			void (async () => {
				try {
					const blob = await getCroppedBlob(
						cropper,
						"image/png",
						annotationsRef.current,
						arrowsRef.current,
					);
					const ok = await writeImageToClipboard(blob);
					if (ok) {
						onSuccessRef.current();
					} else {
						onFailureRef.current();
					}
				} catch {
					onFailureRef.current();
				}
			})();
		};

		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);
}
