// SPA 側で ?return_to の安全性を確認したいときに使う。
// サーバー側（workers/return-to.ts）と同じロジックを軽量化したもの。
// サーバー側で必ず最終チェックは行うので、ここは UX 表示用と割り切る。

/** 渡された URL が「明らかにオープンリダイレクト」でない構造を持つかをざっくり判定する。 */
export function isLikelyValidReturnTo(
	returnTo: string | null | undefined,
): boolean {
	if (!returnTo) return false;
	try {
		const url = new URL(returnTo, window.location.origin);
		return url.protocol === "https:" || url.protocol === "http:";
	} catch {
		return false;
	}
}

/** URL からホスト名を抽出（loader の小さなチップ表示用）。 */
export function extractHost(returnTo: string | null | undefined): string {
	if (!returnTo) return "";
	try {
		const url = new URL(returnTo, window.location.origin);
		return url.host;
	} catch {
		return "";
	}
}
