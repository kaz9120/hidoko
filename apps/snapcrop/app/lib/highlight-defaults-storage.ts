/**
 * マーカーツールのデフォルト値 (color / opacity / thickness) を localStorage
 * に出し入れする。arrow-defaults-storage.ts の先例どおり、不正値や読込失敗は
 * defensive parse で握り潰してデフォルトに fallback する。SSR では window が
 * 無いので no-op。
 */

import {
	DEFAULT_HIGHLIGHT_DEFAULTS,
	HIGHLIGHT_MAX_OPACITY,
	HIGHLIGHT_MIN_OPACITY,
	HIGHLIGHT_PRESET_COLORS,
	type HighlightDefaults,
	type HighlightStrokeStyle,
	type HighlightThickness,
} from "~/lib/highlight-engine";

const STORAGE_KEY = "snapcrop.highlight.defaults";

const THICKNESSES: ReadonlySet<HighlightThickness> = new Set([
	"sm",
	"md",
	"lg",
]);
const STROKE_STYLES: ReadonlySet<HighlightStrokeStyle> = new Set([
	"clean",
	"sketchy",
]);
// マーカーは固定パレット仕様 (矩形のカスタム色とは違う)。プリセット外の値を
// 復元すると swatch の選択表示と実際の描画色がズレるので、包含チェックで弾く。
const HIGHLIGHT_COLORS: ReadonlySet<string> = new Set(HIGHLIGHT_PRESET_COLORS);

export function loadHighlightDefaults(): HighlightDefaults {
	if (typeof window === "undefined") return DEFAULT_HIGHLIGHT_DEFAULTS;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_HIGHLIGHT_DEFAULTS;
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") {
			return DEFAULT_HIGHLIGHT_DEFAULTS;
		}
		const obj = parsed as Record<string, unknown>;
		const color = obj.color;
		const opacity = obj.opacity;
		const thickness = obj.thickness;
		if (typeof color !== "string" || !HIGHLIGHT_COLORS.has(color)) {
			return DEFAULT_HIGHLIGHT_DEFAULTS;
		}
		if (
			typeof opacity !== "number" ||
			!Number.isFinite(opacity) ||
			opacity < HIGHLIGHT_MIN_OPACITY ||
			opacity > HIGHLIGHT_MAX_OPACITY
		) {
			return DEFAULT_HIGHLIGHT_DEFAULTS;
		}
		if (
			typeof thickness !== "string" ||
			!THICKNESSES.has(thickness as HighlightThickness)
		) {
			return DEFAULT_HIGHLIGHT_DEFAULTS;
		}
		// strokeStyle は後付け。欠落 / 不正値は他フィールドを生かしてデフォルトに倒す
		const strokeStyleRaw = obj.strokeStyle;
		const strokeStyle =
			typeof strokeStyleRaw === "string" &&
			STROKE_STYLES.has(strokeStyleRaw as HighlightStrokeStyle)
				? (strokeStyleRaw as HighlightStrokeStyle)
				: DEFAULT_HIGHLIGHT_DEFAULTS.strokeStyle;
		return {
			color,
			opacity,
			thickness: thickness as HighlightThickness,
			strokeStyle,
		};
	} catch {
		return DEFAULT_HIGHLIGHT_DEFAULTS;
	}
}

export function saveHighlightDefaults(defaults: HighlightDefaults): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
	} catch {
		// private mode / quota exceeded — 黙って諦める
	}
}
