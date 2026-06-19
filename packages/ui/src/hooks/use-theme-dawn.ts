import { useTheme } from "next-themes";
import * as React from "react";

const DAWN_CLASS = "hi-motion-dawn";
const DAWN_DURATION_MS = 1100;

/**
 * `next-themes` の `setTheme` をラップして、テーマ切替時に夜明け演出を
 * 走らせる。`<html>` に `.hi-motion-dawn` を付与してから setTheme を呼び、
 * 1100ms 後にクラスを外す。CSS 側 (motion.css) で background-color や
 * color が `--ease-ember` でゆっくり遷移し、夜が明けるように色が移る。
 *
 * `prefers-reduced-motion: reduce` の環境では motion.css 側で transition が
 * 殺されるので、視覚的な遷移は発生しない（テーマは瞬時に切り替わる）。
 *
 * 戻り値の `theme` `setTheme` 等は `useTheme()` のものをそのまま透過する。
 */
export function useThemeDawn() {
	const ctx = useTheme();
	const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

	React.useEffect(
		() => () => {
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
				document.documentElement.classList.remove(DAWN_CLASS);
			}
		},
		[],
	);

	const setThemeWithDawn = React.useCallback(
		(theme: string) => {
			if (typeof document === "undefined") {
				ctx.setTheme(theme);
				return;
			}
			const root = document.documentElement;
			root.classList.add(DAWN_CLASS);
			ctx.setTheme(theme);
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				root.classList.remove(DAWN_CLASS);
				timeoutRef.current = null;
			}, DAWN_DURATION_MS);
		},
		[ctx],
	);

	return { ...ctx, setTheme: setThemeWithDawn };
}
