import { useEffect, useState } from "react";

/**
 * 親要素のサイズに合わせて、固定 baseW × baseH のフレームをどう縮小するかを返す。
 * - `mode: "contain"` は両軸に収める（プレビュー用）
 * - `mode: "width"` は幅にだけ合わせる（サムネ用：縦は CSS の aspect-ratio で決まる）
 */
export function useFitScale(
	wrapRef: React.RefObject<HTMLElement | null>,
	baseW: number,
	baseH: number,
	mode: "contain" | "width" = "contain",
): number {
	const [scale, setScale] = useState(mode === "width" ? 0.1 : 0.5);
	useEffect(() => {
		const el = wrapRef.current;
		if (!el) return;
		const compute = () => {
			if (mode === "width") {
				setScale(el.clientWidth / baseW);
				return;
			}
			const r = el.getBoundingClientRect();
			setScale(Math.min(r.width / baseW, r.height / baseH, 1));
		};
		compute();
		const ro = new ResizeObserver(compute);
		ro.observe(el);
		return () => ro.disconnect();
	}, [wrapRef, baseW, baseH, mode]);
	return scale;
}
