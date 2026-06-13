/**
 * note-ogp エディタの「UI の状態」(画面に出すか / 畳むか) を localStorage に
 * 出し入れする。本体の state (Fields) や issue / profile とは別軸の値で、
 * 復元時に画面が前回の見え方を維持できるようにする。
 *
 * 現在の対象 (Issue #138 / #139):
 * - サイドパネル (ControlPanel) の折りたたみ
 * - タイムライン実寸プレビューの表示
 *
 * SSR では window が無いので no-op。
 */

const SIDEBAR_KEY = "hidoko-note-ogp:sidebar-collapsed";
const TIMELINE_KEY = "hidoko-note-ogp:timeline-open";

function loadBool(key: string, fallback: boolean): boolean {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		if (raw === "true") return true;
		if (raw === "false") return false;
		return fallback;
	} catch {
		return fallback;
	}
}

function saveBool(key: string, value: boolean): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key, value ? "true" : "false");
	} catch {
		// quota error は黙って捨てる
	}
}

export function loadSidebarCollapsed(): boolean {
	return loadBool(SIDEBAR_KEY, false);
}

export function saveSidebarCollapsed(collapsed: boolean): void {
	saveBool(SIDEBAR_KEY, collapsed);
}

/** タイムライン実寸プレビューの「開いている」状態。既定は閉じ。 */
export function loadTimelineOpen(): boolean {
	return loadBool(TIMELINE_KEY, false);
}

export function saveTimelineOpen(open: boolean): void {
	saveBool(TIMELINE_KEY, open);
}
