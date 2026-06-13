/**
 * 「スタイルプリセット」の選択状態 (Issue #145) を localStorage に出し入れする。
 * 各 XxxDefaults は別キーで管理されるが、それらの上に乗る「テイスト」を
 * このキーで保存し、起動時に最後に選んだプリセットの defaults を再現する。
 *
 * SSR では window が無いので no-op。
 */

import { DEFAULT_STYLE_PRESET, type StylePresetId } from "~/lib/style-presets";

const STORAGE_KEY = "snapcrop.style-preset";

const VALID_IDS: ReadonlySet<StylePresetId> = new Set([
	"clean",
	"sketch",
	"emphasis",
	"soft",
]);

export function loadStylePreset(): StylePresetId {
	if (typeof window === "undefined") return DEFAULT_STYLE_PRESET;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw || !VALID_IDS.has(raw as StylePresetId)) {
			return DEFAULT_STYLE_PRESET;
		}
		return raw as StylePresetId;
	} catch {
		return DEFAULT_STYLE_PRESET;
	}
}

export function saveStylePreset(id: StylePresetId): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, id);
	} catch {
		// quota error は黙って捨てる
	}
}
