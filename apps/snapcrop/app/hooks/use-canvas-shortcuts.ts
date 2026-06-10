import { type RefObject, useEffect, useRef } from "react";
import { type ViewportHandle, ZOOM_STEP } from "~/components/canvas/viewport";

/**
 * ⌘0 でフィット、⌘1 で 100%、⌘− / ⌘+ で段階ズームするキャンバス用
 * ショートカット。⌘+ は US 配列の ⌘⇧= ("+") と ⌘= の両方を受ける。
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
			const key = event.key;
			if (
				key !== "0" &&
				key !== "1" &&
				key !== "-" &&
				key !== "+" &&
				key !== "="
			) {
				return;
			}
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
			if (key === "0") {
				vp.fitToContainer();
			} else if (key === "1") {
				vp.setActualSize();
			} else if (key === "-") {
				vp.setZoom(vp.getZoom() / ZOOM_STEP);
			} else {
				vp.setZoom(vp.getZoom() * ZOOM_STEP);
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);
}
