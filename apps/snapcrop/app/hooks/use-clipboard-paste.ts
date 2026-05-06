import { useEffect, useRef } from "react";
import { findImageInPasteEvent } from "~/lib/clipboard";

/**
 * document に paste リスナを登録し、画像が含まれていれば onPaste に渡す。
 * テキスト等の paste は無視する (preventDefault せず通常通り処理させる)。
 */
export function useClipboardPaste(onPaste: (blob: Blob) => void) {
	const onPasteRef = useRef(onPaste);
	onPasteRef.current = onPaste;

	useEffect(() => {
		const handler = (event: ClipboardEvent) => {
			if (!event.clipboardData) {
				return;
			}
			const blob = findImageInPasteEvent(event.clipboardData);
			if (blob) {
				event.preventDefault();
				onPasteRef.current(blob);
			}
		};

		document.addEventListener("paste", handler);
		return () => document.removeEventListener("paste", handler);
	}, []);
}
