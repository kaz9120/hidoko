import { type RefObject, useEffect, useRef } from "react";
import type { ViewportHandle } from "~/components/canvas/viewport";

/**
 * ⌘0 でフィット、⌘1 で 100% にズームするキャンバス用ショートカット。
 * 入力欄上では既定動作を優先する。
 */
export function useCanvasShortcuts(
	viewportRef: RefObject<ViewportHandle | null>,
) {
	const viewportRefRef = useRef(viewportRef);
	viewportRefRef.current = viewportRef;

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey)) return;
			if (event.key !== "0" && event.key !== "1") return;
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}
			event.preventDefault();
			const vp = viewportRefRef.current.current;
			if (!vp) return;
			if (event.key === "0") {
				vp.fitToContainer();
			} else {
				vp.setActualSize();
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);
}
