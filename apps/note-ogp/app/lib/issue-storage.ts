/**
 * 直近書き出した「号 (vol)」の記録 (Issue #137)。本体の state (`storage.ts`) と
 * 切り離して別キーで保存する。本体の load/save は復元のための「履歴」だが、
 * こちらは「次の号を作るときの初期値」を決めるための「アンカー」なので、
 * リセットしても消えない方が運用上望ましい。SSR では window が無いので no-op。
 *
 * 値は文字列のまま保存する (UI 上のフィールドが string で、ゼロ詰め "013" を
 * 保ちたいため)。
 */

const STORAGE_KEY = "hidoko-note-ogp:last-issue";

export function saveLastIssue(issue: string): void {
	if (typeof window === "undefined") return;
	if (!issue) return;
	try {
		window.localStorage.setItem(STORAGE_KEY, issue);
	} catch {
		// quota error 等は黙って捨てる
	}
}

export function loadLastIssue(): string | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw || !/^\d+$/.test(raw)) return null;
		return raw;
	} catch {
		return null;
	}
}

/**
 * 直近の号から +1 した文字列を返す。ゼロ詰めは入力の桁数を保つ
 * (例: "013" → "014"、"7" → "8"、"099" → "100")。
 * 直近の号が無いときは `fallback`（DEFAULTS.issue 想定）をそのまま返す。
 */
export function computeNextIssue(fallback: string): string {
	const last = loadLastIssue();
	if (last === null) return fallback;
	const n = Number.parseInt(last, 10);
	if (!Number.isFinite(n)) return fallback;
	const next = String(n + 1);
	// ゼロ詰めは入力の桁数を保つ (繰り上がりで桁が増えたらそのまま)
	return next.length < last.length ? next.padStart(last.length, "0") : next;
}

/**
 * 今月の `YYYY.MM` 文字列。`new Date()` を使うので SSR では使わない
 * (UI 側で useEffect / イベントハンドラ内から呼ぶ)。
 */
export function computeThisMonth(): string {
	const now = new Date();
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${now.getFullYear()}.${pad(now.getMonth() + 1)}`;
}
