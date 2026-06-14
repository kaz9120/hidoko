import { useCallback, useEffect, useRef, useState } from "react";
import {
	computeNextIssue,
	computeThisMonth,
	saveLastIssue,
} from "~/lib/issue-storage";
import type { Fields } from "~/lib/og-templates";
import { DEFAULTS, loadState, saveState } from "~/lib/storage";

export type NoteOgpStateHook = {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	reset: () => void;
	/**
	 * PNG 書き出しが成功したことを記録する。次回 reset したときに、ここで記録
	 * した vol + 1 が初期値に乗る (Issue #137)。
	 */
	recordExport: (issue: string) => void;
	/**
	 * 直近の自動保存（localStorage への永続化）が成功した時刻。初回マウント前は
	 * null。StatusBar に「保存: 12:34」を出すための情報源 (Issue #134)。
	 */
	lastSavedAt: Date | null;
};

export function useNoteOgpState(): NoteOgpStateHook {
	const [state, setState] = useState<Fields>(() => loadState());
	const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
	// 初回マウントの saveState は state 復元と等価で「保存」ではないので、
	// 2 回目以降の effect で初めて lastSavedAt を更新する。
	const initialRender = useRef(true);

	useEffect(() => {
		saveState(state);
		if (initialRender.current) {
			initialRender.current = false;
			return;
		}
		setLastSavedAt(new Date());
	}, [state]);

	const update = useCallback((patch: Partial<Fields>) => {
		setState((s) => ({ ...s, ...patch }));
	}, []);

	const reset = useCallback(() => {
		// 「新しい号を作る」操作なので、issue は前号 +1、date は今月で初期化する
		// (Issue #137)。手で上書きした値は通常の保存ルートで残る。
		setState({
			...DEFAULTS,
			issue: computeNextIssue(DEFAULTS.issue),
			date: computeThisMonth(),
		});
	}, []);

	const recordExport = useCallback((issue: string) => {
		saveLastIssue(issue);
	}, []);

	return { state, update, reset, recordExport, lastSavedAt };
}
