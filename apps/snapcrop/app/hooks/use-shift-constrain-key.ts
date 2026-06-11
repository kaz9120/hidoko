import { useEffect } from "react";

/**
 * interaction 中だけ window の Shift keydown / keyup を監視し、拘束の on/off を
 * engine へ伝える。移動中は各 interaction layer が pointermove の shiftKey を
 * 渡すので、これは「ポインタ静止中に Shift を押した・離した」瞬間にも即座に
 * 追従させるための補完。
 */
export function useShiftConstrainKey(
	active: boolean,
	onChange: (constrain: boolean) => void,
) {
	useEffect(() => {
		if (!active) return;
		const handler = (event: KeyboardEvent) => {
			if (event.key !== "Shift") return;
			onChange(event.type === "keydown");
		};
		window.addEventListener("keydown", handler);
		window.addEventListener("keyup", handler);
		return () => {
			window.removeEventListener("keydown", handler);
			window.removeEventListener("keyup", handler);
		};
	}, [active, onChange]);
}
