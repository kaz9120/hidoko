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
	type HighlightDefaults,
	type HighlightThickness,
} from "~/lib/highlight-engine";

const STORAGE_KEY = "snapcrop.highlight.defaults";

const THICKNESSES: ReadonlySet<HighlightThickness> = new Set([
	"sm",
	"md",
	"lg",
]);
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

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
		if (typeof color !== "string" || !HEX_COLOR.test(color)) {
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
		return {
			color,
			opacity,
			thickness: thickness as HighlightThickness,
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
