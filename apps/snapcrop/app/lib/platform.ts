/**
 * Apple 系プラットフォーム (macOS / iOS) かどうかを判定する。
 * ショートカット表記 (⌘ / Ctrl) の出し分けに使う。
 *
 * prerender / SSR では navigator が無いので true (⌘ 表記) に倒す。
 * 既存 UI (ヘッダ tooltip やステータスバー) が ⌘ 表記をデフォルトに
 * しているのと揃えるため。
 */
export function isApplePlatform(): boolean {
	if (typeof navigator === "undefined") {
		return true;
	}
	return /Mac|iPhone|iPad|iPod/i.test(
		navigator.platform || navigator.userAgent,
	);
}
