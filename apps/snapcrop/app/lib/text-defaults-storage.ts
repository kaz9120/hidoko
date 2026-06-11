/**
 * テキストツールのデフォルト値 (fontFamily / fontSize / align / bold / italic /
 * color / background) を localStorage に出し入れする。arrow-defaults-storage.ts
 * の先例どおり、不正値や読込失敗は defensive parse で握り潰してデフォルトに
 * fallback する。SSR では window が無いので no-op。
 */

import {
	DEFAULT_TEXT_DEFAULTS,
	MAX_TEXT_FONT_SIZE,
	MIN_TEXT_FONT_SIZE,
	type TextAlign,
	type TextBackground,
	type TextDefaults,
	type TextFontFamily,
} from "~/lib/text-engine";

const STORAGE_KEY = "snapcrop.text.defaults";

const FONT_FAMILIES: ReadonlySet<TextFontFamily> = new Set([
	"sans",
	"serif",
	"mono",
]);
const ALIGNS: ReadonlySet<TextAlign> = new Set(["left", "center", "right"]);
const BACKGROUNDS: ReadonlySet<TextBackground> = new Set([
	"none",
	"white",
	"black",
]);
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function loadTextDefaults(): TextDefaults {
	if (typeof window === "undefined") return DEFAULT_TEXT_DEFAULTS;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_TEXT_DEFAULTS;
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return DEFAULT_TEXT_DEFAULTS;
		const obj = parsed as Record<string, unknown>;
		const fontFamily = obj.fontFamily;
		const fontSize = obj.fontSize;
		const align = obj.align;
		const bold = obj.bold;
		const italic = obj.italic;
		const color = obj.color;
		const background = obj.background;
		if (
			typeof fontFamily !== "string" ||
			!FONT_FAMILIES.has(fontFamily as TextFontFamily)
		) {
			return DEFAULT_TEXT_DEFAULTS;
		}
		if (
			typeof fontSize !== "number" ||
			!Number.isFinite(fontSize) ||
			fontSize < MIN_TEXT_FONT_SIZE ||
			fontSize > MAX_TEXT_FONT_SIZE
		) {
			return DEFAULT_TEXT_DEFAULTS;
		}
		if (typeof align !== "string" || !ALIGNS.has(align as TextAlign)) {
			return DEFAULT_TEXT_DEFAULTS;
		}
		if (typeof bold !== "boolean" || typeof italic !== "boolean") {
			return DEFAULT_TEXT_DEFAULTS;
		}
		if (typeof color !== "string" || !HEX_COLOR.test(color)) {
			return DEFAULT_TEXT_DEFAULTS;
		}
		if (
			typeof background !== "string" ||
			!BACKGROUNDS.has(background as TextBackground)
		) {
			return DEFAULT_TEXT_DEFAULTS;
		}
		return {
			fontFamily: fontFamily as TextFontFamily,
			fontSize: Math.round(fontSize),
			align: align as TextAlign,
			bold,
			italic,
			color,
			background: background as TextBackground,
		};
	} catch {
		return DEFAULT_TEXT_DEFAULTS;
	}
}

export function saveTextDefaults(defaults: TextDefaults): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
	} catch {
		// private mode / quota exceeded — 黙って諦める
	}
}
