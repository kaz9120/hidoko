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

	useEffect(() => {
		saveState(state);
	}, [state]);

	// 初回起動（localStorage 未登録）のときは、DEFAULTS の固定 date ではなく
	// 当月で立ち上げる。DEFAULTS.date を `new Date()` 由来にすると prerender で
	// 焼き込まれた古い月が出てしまうため、SSR では DEFAULTS を保ち、クライアント
	// マウント後にだけ当月で上書きする。
	useEffect(() => {
		if (hasStoredState()) return;
		setState((s) => ({
			...s,
			issue: computeNextIssue(DEFAULTS.issue),
			date: computeToday(),
		}));
	}, []);

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
