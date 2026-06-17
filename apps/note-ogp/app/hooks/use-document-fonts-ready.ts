import { useEffect, useState } from "react";

/**
 * Web フォント (Newsreader / Shippori Mincho / LINE Seed JP など) の読み込み
 * 完了を購読する。AutoFitTitle が初回マウント時のフォールバック書体メトリクス
 * で確定してしまうのを防ぐため、依存配列に挟んで再計測のトリガに使う。
 *
 * 初期値は `document.fonts.status === "loaded"` を同期で読み、既にロード済み
 * なら最初から true を返す。キャッシュからの再訪時に「false → microtask 後に
 * true」の遷移で再計測が走るのを避けて、ちらつきを抑える。
 */
export function useDocumentFontsReady(): boolean {
	const [ready, setReady] = useState(() => {
		if (typeof document === "undefined") return true;
		if (!document.fonts) return true;
		return document.fonts.status === "loaded";
	});

	useEffect(() => {
		if (ready) return;
		if (typeof document === "undefined" || !document.fonts) return;
		let canceled = false;
		document.fonts.ready.then(() => {
			if (!canceled) setReady(true);
		});
		return () => {
			canceled = true;
		};
	}, [ready]);

	return ready;
}
