/**
 * 「プロフィール（ブランド表記 / 名前 / アカウント / 炎マーク）の初期設定を
 * 一度終えたか」だけを別キーで管理する (Issue #135)。
 *
 * プロフィールの値そのものは既存の本体 state (`storage.ts` の
 * `hidoko-note-ogp:v1`) に同居し、テンプレ描画から直接引かれる。この
 * フラグは「初回ダイアログを開くべきか」の判定にだけ使う。
 *
 * SSR では window が無いので no-op。
 */

const STORAGE_KEY = "hidoko-note-ogp:profile-bootstrapped";

export function isProfileBootstrapped(): boolean {
	if (typeof window === "undefined") return true;
	try {
		return window.localStorage.getItem(STORAGE_KEY) === "true";
	} catch {
		// quota error / disabled storage は「ダイアログ無し」に倒す
		return true;
	}
}

export function markProfileBootstrapped(): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, "true");
	} catch {
		// quota error は黙って捨てる
	}
}
