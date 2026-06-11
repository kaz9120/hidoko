import { useCallback, useEffect, useState } from "react";
import type { Fields } from "~/lib/og-templates";
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

	const update = useCallback((patch: Partial<Fields>) => {
		setState((s) => ({ ...s, ...patch }));
	}, []);

	const reset = useCallback(() => {
		setState(DEFAULTS);
	}, []);

	return { state, update, reset };
}
