/**
 * ControlPanel の三段ウィザード（① 台紙 → ② 内容 → ③ 仕上げ）で、現在
 * どのステップにいるかを localStorage に出し入れする (Issue #136)。
 *
 * 本体 state とは別軸の UI 状態 (= リロードしても続きから入れるようにする
 * ための復元用) で、SSR では window が無いので no-op。
 */

const STORAGE_KEY = "hidoko-note-ogp:wizard-step";

export type WizardStep = 1 | 2 | 3;

export const DEFAULT_WIZARD_STEP: WizardStep = 1;

export function loadWizardStep(): WizardStep {
	if (typeof window === "undefined") return DEFAULT_WIZARD_STEP;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		const n = Number(raw);
		if (n === 1 || n === 2 || n === 3) return n;
		return DEFAULT_WIZARD_STEP;
	} catch {
		return DEFAULT_WIZARD_STEP;
	}
}

export function saveWizardStep(step: WizardStep): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, String(step));
	} catch {
		// quota error は黙って捨てる
	}
}
