/**
 * 矢印ツールのデフォルト値 (line / startCap / endCap / color / thickness) を
 * localStorage に出し入れする。rect-defaults-storage.ts の先例どおり、
 * 不正値や読込失敗は defensive parse で握り潰してデフォルトに fallback する。
 * SSR では window が無いので no-op。
 */

import {
	type ArrowCapStyle,
	type ArrowDefaults,
	type ArrowLineStyle,
	type ArrowStrokeStyle,
	type ArrowThickness,
	DEFAULT_ARROW_DEFAULTS,
} from "~/lib/arrow-engine";

const STORAGE_KEY = "snapcrop.arrow.defaults";

const LINES: ReadonlySet<ArrowLineStyle> = new Set(["straight", "curve"]);
const CAPS: ReadonlySet<ArrowCapStyle> = new Set(["none", "arrow", "dot"]);
const THICKNESSES: ReadonlySet<ArrowThickness> = new Set(["sm", "md", "lg"]);
const STROKE_STYLES: ReadonlySet<ArrowStrokeStyle> = new Set([
	"clean",
	"sketchy",
]);
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function loadArrowDefaults(): ArrowDefaults {
	if (typeof window === "undefined") return DEFAULT_ARROW_DEFAULTS;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_ARROW_DEFAULTS;
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return DEFAULT_ARROW_DEFAULTS;
		const obj = parsed as Record<string, unknown>;
		const line = obj.line;
		const startCap = obj.startCap;
		const endCap = obj.endCap;
		const color = obj.color;
		const thickness = obj.thickness;
		if (typeof line !== "string" || !LINES.has(line as ArrowLineStyle)) {
			return DEFAULT_ARROW_DEFAULTS;
		}
		if (
			typeof startCap !== "string" ||
			!CAPS.has(startCap as ArrowCapStyle) ||
			typeof endCap !== "string" ||
			!CAPS.has(endCap as ArrowCapStyle)
		) {
			return DEFAULT_ARROW_DEFAULTS;
		}
		if (typeof color !== "string" || !HEX_COLOR.test(color)) {
			return DEFAULT_ARROW_DEFAULTS;
		}
		if (
			typeof thickness !== "string" ||
			!THICKNESSES.has(thickness as ArrowThickness)
		) {
			return DEFAULT_ARROW_DEFAULTS;
		}
		// style は後付けフィールドなので、欠落 (旧フォーマット) や不正値は
		// 他のフィールドを生かしたままデフォルトに倒す
		const style = obj.style;
		const strokeStyle =
			typeof style === "string" && STROKE_STYLES.has(style as ArrowStrokeStyle)
				? (style as ArrowStrokeStyle)
				: DEFAULT_ARROW_DEFAULTS.style;
		return {
			line: line as ArrowLineStyle,
			startCap: startCap as ArrowCapStyle,
			endCap: endCap as ArrowCapStyle,
			color,
			thickness: thickness as ArrowThickness,
			style: strokeStyle,
		};
	} catch {
		return DEFAULT_ARROW_DEFAULTS;
	}
}

export function saveArrowDefaults(defaults: ArrowDefaults): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
	} catch {
		// private mode / quota exceeded — 黙って諦める
	}
}
