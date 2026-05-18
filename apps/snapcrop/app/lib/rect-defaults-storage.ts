/**
 * 矩形ツールのデフォルト値 (style / color / thickness) を localStorage に
 * 出し入れする。不正値や読込失敗は defensive parse で握り潰し、デフォルトに
 * fallback する。SSR では window が無いので no-op。
 */

import {
	DEFAULT_RECT_DEFAULTS,
	type RectDefaults,
	type RectStyle,
	type RectThickness,
} from "~/lib/rect-engine";

const STORAGE_KEY = "snapcrop.rect.defaults";

const STYLES: ReadonlySet<RectStyle> = new Set(["outline", "fill", "mosaic"]);
const THICKNESSES: ReadonlySet<RectThickness> = new Set(["sm", "md", "lg"]);
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function loadRectDefaults(): RectDefaults {
	if (typeof window === "undefined") return DEFAULT_RECT_DEFAULTS;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_RECT_DEFAULTS;
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return DEFAULT_RECT_DEFAULTS;
		const obj = parsed as Record<string, unknown>;
		const style = obj.style;
		const color = obj.color;
		const thickness = obj.thickness;
		if (typeof style !== "string" || !STYLES.has(style as RectStyle)) {
			return DEFAULT_RECT_DEFAULTS;
		}
		if (typeof color !== "string" || !HEX_COLOR.test(color)) {
			return DEFAULT_RECT_DEFAULTS;
		}
		if (
			typeof thickness !== "string" ||
			!THICKNESSES.has(thickness as RectThickness)
		) {
			return DEFAULT_RECT_DEFAULTS;
		}
		return {
			style: style as RectStyle,
			color,
			thickness: thickness as RectThickness,
		};
	} catch {
		return DEFAULT_RECT_DEFAULTS;
	}
}

export function saveRectDefaults(defaults: RectDefaults): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
	} catch {
		// private mode / quota exceeded — 黙って諦める
	}
}
