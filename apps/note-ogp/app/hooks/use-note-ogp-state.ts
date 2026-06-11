import { useCallback, useEffect, useState } from "react";
import type { Fields } from "~/lib/og-templates";
import { extractPhotoPalettes } from "~/lib/photo-palette";
import { DEFAULTS, loadState, saveState } from "~/lib/storage";

export type NoteOgpStateHook = {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	reset: () => void;
};

export function useNoteOgpState(): NoteOgpStateHook {
	const [state, setState] = useState<Fields>(() => loadState());

	useEffect(() => {
		saveState(state);
	}, [state]);

	// 写真が設定・差し替えされたら配色候補（馴染ませ / 引き立て）を抽出し直す。
	// 写真が消えても候補は残す — パレットは写真と独立して保存されるため
	// （写真はサイズ超過で localStorage に載らないことがある）。
	const image = state.image;
	useEffect(() => {
		if (!image) return;
		let cancelled = false;
		extractPhotoPalettes(image).then((photoPalettes) => {
			if (cancelled || !photoPalettes) return;
			// 抽出中に写真が差し替わっていたら古い結果は捨てる
			setState((s) => (s.image === image ? { ...s, photoPalettes } : s));
		});
		return () => {
			cancelled = true;
		};
	}, [image]);

	const update = useCallback((patch: Partial<Fields>) => {
		setState((s) => ({ ...s, ...patch }));
	}, []);

	const reset = useCallback(() => {
		setState(DEFAULTS);
	}, []);

	return { state, update, reset };
}
