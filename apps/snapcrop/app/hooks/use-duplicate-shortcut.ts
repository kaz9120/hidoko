import { useEffect, useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { useDuplicateAnnotation } from "~/hooks/use-duplicate-annotation";
import type { AnnotationHit, AnnotationLists } from "~/lib/annotation-hit-test";

/**
 * ⌘/Ctrl + D — 選択中の注釈を種別 (矩形 / 矢印 / テキスト / マーカー) を
 * 問わず複製する。複製は 16px 右下へオフセットして置かれ、複製後は
 * コピー側が選択される。
 *
 * 注釈を選択していないときはブラウザ標準 (ブックマーク追加) に渡したいので
 * preventDefault しない。入力欄 (input / textarea / contenteditable) と
 * IME 入力中は無効化 (use-rect-shortcuts.ts と同じガード)。
 */
export function useDuplicateShortcut() {
	const {
		image,
		selectedAnnotationId,
		annotations,
		arrows,
		texts,
		highlights,
	} = useSnapcrop();
	const duplicateAnnotation = useDuplicateAnnotation();

	// ref で常に最新値を参照 — useEffect の依存を増やさないため
	const imageRef = useRef(image);
	imageRef.current = image;
	const selectedIdRef = useRef(selectedAnnotationId);
	selectedIdRef.current = selectedAnnotationId;
	const listsRef = useRef<AnnotationLists>({
		annotations,
		arrows,
		texts,
		highlights,
	});
	listsRef.current = { annotations, arrows, texts, highlights };
	const duplicateRef = useRef(duplicateAnnotation);
	duplicateRef.current = duplicateAnnotation;

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey)) return;
			if (event.shiftKey || event.altKey) return;
			if (event.key !== "d" && event.key !== "D") return;
			if (event.isComposing || event.keyCode === 229) return;
			if (isInputTarget(event.target)) return;

			const img = imageRef.current;
			const id = selectedIdRef.current;
			if (!img || !id) return;
			const lists = listsRef.current;
			// 選択 id は全種別を通して一意なので、最初に一致したものが選択中の注釈
			const target: AnnotationHit | undefined =
				lists.annotations.find((a) => a.id === id) ??
				lists.arrows.find((a) => a.id === id) ??
				lists.texts.find((t) => t.id === id) ??
				lists.highlights.find((h) => h.id === id);
			if (!target) return;
			event.preventDefault();
			duplicateRef.current(target, {
				naturalWidth: img.width,
				naturalHeight: img.height,
			});
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
