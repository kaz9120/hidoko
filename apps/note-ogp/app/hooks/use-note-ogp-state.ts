import { useCallback, useEffect, useState } from "react";
import {
	computeNextIssue,
	computeToday,
	saveLastIssue,
} from "~/lib/issue-storage";
import type { Fields } from "~/lib/og-templates";
import { DEFAULTS, hasStoredState, loadState, saveState } from "~/lib/storage";

export type NoteOgpStateHook = {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	reset: () => void;
	/**
	 * PNG 書き出しが成功したことを記録する。次回 reset したときに、ここで記録
	 * した vol + 1 が初期値に乗る (Issue #137)。
	 */
	recordExport: (issue: string) => void;
};

export function useNoteOgpState(): NoteOgpStateHook {
	const [state, setState] = useState<Fields>(() => loadState());
	// 「初回起動か」は最初のレンダリング中に確定させる。effect で見に行くと、
	// 先に宣言した保存 effect が localStorage を埋めた後になり、必ず
	// 「保存済み」に倒れる。loadState() は v3 からの移行時だけ書き込むので、
	// この順（loadState → 判定）なら移行してきた人は保存済みとして扱われる。
	const [isFirstRun] = useState(() => !hasStoredState());

	useEffect(() => {
		saveState(state);
	}, [state]);

	// 初回起動のときは、DEFAULTS の固定値ではなく前号 +1 と今日で立ち上げる。
	// DEFAULTS.date を `new Date()` 由来にすると prerender で焼き込まれた古い日付が
	// 出てしまうため、SSR では DEFAULTS を保ち、クライアントマウント後に上書きする。
	useEffect(() => {
		if (!isFirstRun) return;
		setState((s) => ({
			...s,
			issue: computeNextIssue(DEFAULTS.issue),
			date: computeToday(),
		}));
	}, [isFirstRun]);

	const update = useCallback((patch: Partial<Fields>) => {
		setState((s) => ({ ...s, ...patch }));
	}, []);

	const reset = useCallback(() => {
		// 「新しい号を作る」操作なので、issue は前号 +1、date は今月で初期化する
		// (Issue #137)。手で上書きした値は通常の保存ルートで残る。
		setState({
			...DEFAULTS,
			issue: computeNextIssue(DEFAULTS.issue),
			date: computeToday(),
		});
	}, []);

	const recordExport = useCallback((issue: string) => {
		saveLastIssue(issue);
	}, []);

	return { state, update, reset, recordExport };
}
