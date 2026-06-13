/**
 * snapcrop の「スタイルプリセット」。chat3 の確定仕様 (案 B+) で導入する
 * 「同じテイストで何枚も撮る」を支える背骨で、矩形 (枠線)・矢印・マーカーの
 * 既定値 (太さ / 質感 / 矢頭の出し方など) を 1 つの id にまとめる。
 *
 * Phase 1 (Issue #145) のこの段階では、各種 `XxxDefaults` のうち「線の質感
 * (clean / sketchy)」「太さ (sm/md/lg)」「不透明度」「矢印の線形と端点キャップ」
 * を束ねる。`color` はプリセットの責務ではない (色集約は別 PR、Phase 1b)。
 *
 * Phase 2 以降で text プリセット (書体・背景)・モザイクの粒度などを足す
 * 想定だが、現段階では型を最小に保つ。
 */

import type {
	ArrowCapStyle,
	ArrowDefaults,
	ArrowLineStyle,
	ArrowStrokeStyle,
	ArrowThickness,
} from "~/lib/arrow-engine";
import type {
	HighlightDefaults,
	HighlightStrokeStyle,
	HighlightThickness,
} from "~/lib/highlight-engine";
import type {
	RectDefaults,
	RectStrokeStyle,
	RectThickness,
} from "~/lib/rect-engine";

export type StylePresetId = "clean" | "sketch" | "emphasis" | "soft";

export type RectPresetParts = {
	strokeStyle: RectStrokeStyle;
	thickness: RectThickness;
};

export type ArrowPresetParts = {
	style: ArrowStrokeStyle;
	thickness: ArrowThickness;
	line: ArrowLineStyle;
	startCap: ArrowCapStyle;
	endCap: ArrowCapStyle;
};

export type HighlightPresetParts = {
	strokeStyle: HighlightStrokeStyle;
	thickness: HighlightThickness;
	opacity: number;
};

export type StylePresetSpec = {
	id: StylePresetId;
	label: string;
	/** ツールレールの tooltip / トーストで添える短い説明。 */
	hint: string;
	rect: RectPresetParts;
	arrow: ArrowPresetParts;
	highlight: HighlightPresetParts;
};

/**
 * 確定仕様 (`snapcrop 新デザイン 最終版.html` の FinalSpec) を、現状の
 * ArrowDefaults / RectDefaults / HighlightDefaults に翻訳した値。フォントや
 * 影は別 Phase で扱うので、現段階では「線そのものの見え」だけを束ねる。
 */
export const STYLE_PRESETS: Record<StylePresetId, StylePresetSpec> = {
	clean: {
		id: "clean",
		label: "きっちり",
		hint: "直線・塗り矢頭・薄めマーカー",
		rect: { strokeStyle: "clean", thickness: "sm" },
		arrow: {
			style: "clean",
			thickness: "sm",
			line: "straight",
			startCap: "none",
			endCap: "arrow",
		},
		highlight: { strokeStyle: "clean", thickness: "md", opacity: 0.45 },
	},
	sketch: {
		id: "sketch",
		label: "手書き",
		hint: "ゆるい曲線・揺らぎ・少し濃いマーカー",
		rect: { strokeStyle: "sketchy", thickness: "md" },
		arrow: {
			style: "sketchy",
			thickness: "md",
			line: "curve",
			startCap: "none",
			endCap: "arrow",
		},
		highlight: { strokeStyle: "sketchy", thickness: "md", opacity: 0.5 },
	},
	emphasis: {
		id: "emphasis",
		label: "強調",
		hint: "太線・大きな矢頭・濃いマーカー",
		rect: { strokeStyle: "clean", thickness: "lg" },
		arrow: {
			style: "clean",
			thickness: "lg",
			line: "straight",
			startCap: "none",
			endCap: "arrow",
		},
		highlight: { strokeStyle: "clean", thickness: "lg", opacity: 0.65 },
	},
	soft: {
		id: "soft",
		label: "やわらか",
		hint: "中太・ゆるい曲線・丸めキャップ",
		rect: { strokeStyle: "clean", thickness: "md" },
		arrow: {
			style: "clean",
			thickness: "md",
			line: "curve",
			startCap: "none",
			endCap: "dot",
		},
		highlight: { strokeStyle: "clean", thickness: "md", opacity: 0.4 },
	},
};

export const DEFAULT_STYLE_PRESET: StylePresetId = "clean";

export const STYLE_PRESET_ORDER: StylePresetId[] = [
	"clean",
	"sketch",
	"emphasis",
	"soft",
];

/**
 * プリセットの矩形パラメータを既存の RectDefaults に重ねる。色はプリセットの
 * 責務ではないので保持する。
 */
export function applyPresetToRectDefaults(
	base: RectDefaults,
	preset: StylePresetSpec,
): RectDefaults {
	return { ...base, ...preset.rect };
}

export function applyPresetToArrowDefaults(
	base: ArrowDefaults,
	preset: StylePresetSpec,
): ArrowDefaults {
	return { ...base, ...preset.arrow };
}

export function applyPresetToHighlightDefaults(
	base: HighlightDefaults,
	preset: StylePresetSpec,
): HighlightDefaults {
	return { ...base, ...preset.highlight };
}
