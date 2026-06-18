/**
 * 矩形ツールのデフォルト値 (style / color / thickness) を localStorage に
 * 出し入れする。不正値や読込失敗は defensive parse で握り潰し、デフォルトに
 * fallback する。SSR では window が無いので no-op。
 */

import {
	DEFAULT_RECT_DEFAULTS,
	type RectDefaults,
	type RectStrokeStyle,
	type RectStyle,
	type RectThickness,
} from "~/lib/rect-engine";

const STORAGE_KEY = "hidoko-snapcrop-rect-defaults";

const STYLES: ReadonlySet<RectStyle> = new Set(["outline", "fill", "mosaic"]);
const THICKNESSES: ReadonlySet<RectThickness> = new Set(["sm", "md", "lg"]);
const STROKE_STYLES: ReadonlySet<RectStrokeStyle> = new Set([
	"clean",
	"sketchy",
]);
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function loadRectDefaults(): RectDefaults {
	if (typeof window === "undefined") return DEFAULT_RECT_DEFAULTS;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_RECT_DEFAULTS;
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return DEFAULT_RECT_DEFAULTS;
		const obj = parsed as Record<string, unknown>;
		const rawStyle = obj.style;
		const color = obj.color;
		const thickness = obj.thickness;
		if (typeof rawStyle !== "string" || !STYLES.has(rawStyle as RectStyle)) {
			return DEFAULT_RECT_DEFAULTS;
		}
		// 確定仕様で「塗り」(fill) は廃止された (Issue #146)。既存ユーザーが
		// 直近で fill を選んでいた場合は outline に倒して読み戻す。型は互換の
		// ために残しているが、UI に出さない以上は次の defaults 更新でも fill を
		// 書き戻さない。
		const style: RectStyle =
			rawStyle === "fill" ? "outline" : (rawStyle as RectStyle);
		if (typeof color !== "string" || !HEX_COLOR.test(color)) {
			return DEFAULT_RECT_DEFAULTS;
		}
		if (
			typeof thickness !== "string" ||
			!THICKNESSES.has(thickness as RectThickness)
		) {
			return DEFAULT_RECT_DEFAULTS;
		}
		// strokeStyle は後付けフィールドなので、欠落 (旧フォーマット) や不正値は
		// 他のフィールドを生かしたままデフォルトに倒す (arrow-defaults-storage の style と同じ流儀)
		const strokeStyleRaw = obj.strokeStyle;
		const strokeStyle =
			typeof strokeStyleRaw === "string" &&
			STROKE_STYLES.has(strokeStyleRaw as RectStrokeStyle)
				? (strokeStyleRaw as RectStrokeStyle)
				: DEFAULT_RECT_DEFAULTS.strokeStyle;
		return {
			style,
			color,
			thickness: thickness as RectThickness,
			strokeStyle,
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
