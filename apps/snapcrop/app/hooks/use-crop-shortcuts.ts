import { useEffect, useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";

/**
 * クロップ確定の Enter ショートカット。
 *
 * 枠を編集している間だけ効く。確定するとキャンバスが切り取り後に切り替わり、
 * 以降は画面に映っているものがそのまま書き出される。
 *
 * 入力欄・IME 変換中は奪わない。テキストのインライン編集は textarea 上で
 * 起きるので、その Enter (改行) とは衝突しない。
 */
export function useCropShortcuts() {
	const { activeTool, cropEditing, commitCrop, image } = useSnapcrop();

	const stateRef = useRef({ activeTool, cropEditing, commitCrop, image });
	stateRef.current = { activeTool, cropEditing, commitCrop, image };

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (event.key !== "Enter") return;
			if (event.isComposing || event.keyCode === 229) return;
			if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
				return;
			}
			const {
				activeTool: tool,
				cropEditing: editing,
				image: img,
			} = stateRef.current;
			if (!img || tool !== "crop" || !editing) return;
			if (isInputTarget(event.target)) return;

			event.preventDefault();
			stateRef.current.commitCrop();
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
		target.tagName === "SELECT" ||
		target.isContentEditable
	);
}
