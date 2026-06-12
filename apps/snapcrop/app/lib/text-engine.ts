/**
 * テキストアノテーションを画像座標系 (px) で扱う純粋関数群。React 非依存で、
 * arrow-engine.ts / rect-engine.ts と同じ思想 (引数で受け取った annotation を
 * 更新した新しい annotation を返す) に揃える。フォント (sans / serif / mono)、
 * 寄せ (左 / 中央 / 右)、太字 / 斜体、背景 (なし / 白 / 黒)、複数行をサポート
 * する。
 */

import { initialZIndex } from "~/lib/annotation-z-order";
import type { ImageMetrics } from "~/lib/crop-engine";
import { DUPLICATE_OFFSET_PX } from "~/lib/rect-engine";

export type { ImageMetrics };

export type TextFontFamily = "sans" | "serif" | "mono";
export type TextAlign = "left" | "center" | "right";
export type TextBackground = "none" | "white" | "black";

export type TextAnnotation = {
	id: string;
	kind: "text";
	/** アンカー x。align=left なら各行の左端、center なら中央、right なら右端 */
	x: number;
	/** テキストブロックの上端 y */
	y: number;
	/** 本文。改行 (\n) 区切りで複数行 */
	text: string;
	fontFamily: TextFontFamily;
	/** 画像 px でのフォントサイズ */
	fontSize: number;
	align: TextAlign;
	bold: boolean;
	italic: boolean;
	color: string;
	background: TextBackground;
	createdAt: number;
	/** 種別横断の重なり順 (annotation-z-order.ts)。大きいほど前面。 */
	zIndex: number;
};

/**
 * updateText で書き換えてよいフィールドだけを切り出した patch 型。
 * id / kind / createdAt は不変なので含めない (arrow-engine.ts の
 * ArrowAnnotationPatch と同じ理由)。
 */
export type TextAnnotationPatch = Partial<
	Pick<
		TextAnnotation,
		| "x"
		| "y"
		| "text"
		| "fontFamily"
		| "fontSize"
		| "align"
		| "bold"
		| "italic"
		| "color"
		| "background"
		| "zIndex"
	>
>;

export type TextDefaults = {
	fontFamily: TextFontFamily;
	fontSize: number;
	align: TextAlign;
	bold: boolean;
	italic: boolean;
	color: string;
	background: TextBackground;
};

export const DEFAULT_TEXT_DEFAULTS: TextDefaults = {
	fontFamily: "sans",
	fontSize: 24,
	align: "left",
	bold: false,
	italic: false,
	color: "#ef4444",
	background: "none",
};

export const MIN_TEXT_FONT_SIZE = 8;
export const MAX_TEXT_FONT_SIZE = 200;

/** 行送り (fontSize 比)。DOM の line-height と canvas の行間で共有する */
export const TEXT_LINE_HEIGHT = 1.3;

/**
 * alphabetic baseline の行上端からのオフセット (em)。SVG <text> と canvas
 * fillText は両方ともこのモデル値から baseline を引くので、表示と書き出しは
 * 厳密に一致する。値自体は「line-height 1.3 の DOM テキスト (編集中の
 * textarea) と概ね揃う」ように、半行送り 0.15em + 一般的な ascent 0.77em を
 * 想定して決めている。
 */
export const TEXT_ASCENT_RATIO = 0.92;

/** 背景付きのときの左右余白 (fontSize 比)。上下はこの 0.6 倍 */
export const TEXT_BG_PADDING_RATIO = 0.25;

/**
 * フォント選択肢は Web フォントを動的ロードせず、システムフォントの
 * generic スタックで賄う (issue #50 の実装メモ)。
 */
export const TEXT_FONT_STACKS: Record<TextFontFamily, string> = {
	sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif',
	serif:
		'ui-serif, Georgia, "Times New Roman", "Hiragino Mincho ProN", "Noto Serif JP", serif',
	mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace',
};

/**
 * 背景の機能色。画像へ焼き込む注釈色なので、UI クロームの「純白禁止」
 * (DESIGN.md) の対象外として純白 / 純黒を使う。
 */
export function textBackgroundColor(bg: TextBackground): string | null {
	if (bg === "white") return "#ffffff";
	if (bg === "black") return "#000000";
	return null;
}

export function clampFontSize(size: number): number {
	return Math.max(
		MIN_TEXT_FONT_SIZE,
		Math.min(MAX_TEXT_FONT_SIZE, Math.round(size)),
	);
}

/** canvas の ctx.font / CSS の font shorthand 互換のフォント指定文字列 */
export function textFontString(t: {
	fontFamily: TextFontFamily;
	fontSize: number;
	bold: boolean;
	italic: boolean;
}): string {
	const style = t.italic ? "italic " : "";
	const weight = t.bold ? "700" : "400";
	return `${style}${weight} ${t.fontSize}px ${TEXT_FONT_STACKS[t.fontFamily]}`;
}

// 計測用の使い回し 2D context。SSR では作らない (寸法依存の関数は UI 操作と
// エクスポートでしか呼ばれない)。
let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureCtx(): CanvasRenderingContext2D | null {
	if (typeof document === "undefined") return null;
	if (!measureCtx) {
		measureCtx = document.createElement("canvas").getContext("2d");
	}
	return measureCtx;
}

/** font 指定で 1 行の幅を測る。canvas が使えない環境では文字数から概算 */
export function measureLineWidth(
	line: string,
	font: string,
	fontSize: number,
): number {
	const ctx = getMeasureCtx();
	if (ctx) {
		ctx.font = font;
		return ctx.measureText(line).width;
	}
	return line.length * fontSize * 0.6;
}

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };

export function clampPointInImage(pt: Point, img: ImageMetrics): Point {
	return {
		x: Math.max(0, Math.min(pt.x, img.naturalWidth)),
		y: Math.max(0, Math.min(pt.y, img.naturalHeight)),
	};
}

/** arrow-engine.ts の newId と同じ。SSR 環境では呼ばれない (UI 操作のみ)。 */
function newId(): string {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}
	// 防御フォールバック (現代ブラウザでは到達しない想定)
	return `text_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createTextAnnotation(args: {
	x: number;
	y: number;
	text: string;
	defaults: TextDefaults;
}): TextAnnotation {
	return {
		id: newId(),
		kind: "text",
		x: args.x,
		y: args.y,
		text: args.text,
		fontFamily: args.defaults.fontFamily,
		fontSize: args.defaults.fontSize,
		align: args.defaults.align,
		bold: args.defaults.bold,
		italic: args.defaults.italic,
		color: args.defaults.color,
		background: args.defaults.background,
		createdAt: Date.now(),
		zIndex: initialZIndex("text"),
	};
}

/**
 * SVG レイヤー (text-layer.tsx) と canvas エクスポート (image-export.ts) が
 * 同じ見た目を共有するための描画モデル。行ごとの baseline 座標と、背景矩形・
 * 外接矩形に分解する。各行の x はアンカーで、canvas の textAlign / SVG の
 * text-anchor がそこを基準に行を揃える。
 */
export type TextRenderModel = {
	font: string;
	lineHeight: number;
	lines: ReadonlyArray<{ text: string; x: number; baselineY: number }>;
	/** テキスト全体の外接矩形 (背景余白を含まない) */
	bounds: Rect;
	/** 背景矩形。background === "none" のときは null */
	bgRect: (Rect & { radius: number }) | null;
};

export function getTextRenderModel(t: TextAnnotation): TextRenderModel {
	const font = textFontString(t);
	const lineHeight = t.fontSize * TEXT_LINE_HEIGHT;
	const rawLines = t.text.split("\n");
	const blockWidth = rawLines.reduce(
		(max, line) => Math.max(max, measureLineWidth(line, font, t.fontSize)),
		0,
	);
	const left =
		t.align === "left"
			? t.x
			: t.align === "center"
				? t.x - blockWidth / 2
				: t.x - blockWidth;
	const lines = rawLines.map((text, i) => ({
		text,
		x: t.x,
		baselineY: t.y + i * lineHeight + t.fontSize * TEXT_ASCENT_RATIO,
	}));
	const bounds: Rect = {
		x: left,
		y: t.y,
		width: blockWidth,
		height: rawLines.length * lineHeight,
	};
	const pad = t.fontSize * TEXT_BG_PADDING_RATIO;
	const bgRect =
		t.background === "none"
			? null
			: {
					x: bounds.x - pad,
					y: bounds.y - pad * 0.6,
					width: bounds.width + pad * 2,
					height: bounds.height + pad * 1.2,
					radius: Math.max(2, t.fontSize * 0.12),
				};
	return { font, lineHeight, lines, bounds, bgRect };
}

/** hit test / selection overlay 用の外接矩形。背景があれば背景込み。 */
export function textHitBounds(t: TextAnnotation): Rect {
	const m = getTextRenderModel(t);
	return m.bgRect ?? m.bounds;
}

/**
 * createdAt 降順走査 (新しい = 上) で、外接矩形に入るテキストを返す。
 * tolerance は呼び側で zoom を加味した値を渡す (小さい文字でも掴みやすく)。
 */
export function hitTestText(
	texts: readonly TextAnnotation[],
	imgX: number,
	imgY: number,
	tolerance = 2,
): TextAnnotation | null {
	for (let i = texts.length - 1; i >= 0; i--) {
		const t = texts[i];
		const b = textHitBounds(t);
		if (
			imgX >= b.x - tolerance &&
			imgX <= b.x + b.width + tolerance &&
			imgY >= b.y - tolerance &&
			imgY <= b.y + b.height + tolerance
		) {
			return t;
		}
	}
	return null;
}

/**
 * 平行移動。外接矩形が画像内に収まる範囲まで delta を切り詰める
 * (rect の clamp と同じ思想)。テキストブロックが画像より大きい軸は、
 * 操作不能にならないようアンカーだけを画像内に収める。
 */
export function moveText(
	t: TextAnnotation,
	delta: { dx: number; dy: number },
	img: ImageMetrics,
): TextAnnotation {
	const b = textHitBounds(t);
	const dx =
		b.width <= img.naturalWidth
			? Math.max(-b.x, Math.min(delta.dx, img.naturalWidth - (b.x + b.width)))
			: Math.max(-t.x, Math.min(delta.dx, img.naturalWidth - t.x));
	const dy =
		b.height <= img.naturalHeight
			? Math.max(-b.y, Math.min(delta.dy, img.naturalHeight - (b.y + b.height)))
			: Math.max(-t.y, Math.min(delta.dy, img.naturalHeight - t.y));
	return { ...t, x: t.x + dx, y: t.y + dy };
}

/**
 * annotation を位置を変えずに複製して、新しい id / createdAt を持つコピーを
 * 返す。Alt+ドラッグ複製の開始時に使う。
 */
export function cloneTextAnnotation(source: TextAnnotation): TextAnnotation {
	return {
		...source,
		id: newId(),
		createdAt: Date.now(),
		zIndex: initialZIndex("text"),
	};
}

/**
 * annotation を複製して新しい id / createdAt を持つコピーを返す。位置は
 * rect-engine.ts の duplicateRectAnnotation と同じ思想で右下へ
 * DUPLICATE_OFFSET_PX ずらし、画像境界に当たって元と同位置に clamp されて
 * しまう場合は左上方向へフォールバックする。
 */
export function duplicateTextAnnotation(
	source: TextAnnotation,
	img: ImageMetrics,
): TextAnnotation {
	let moved = moveText(
		source,
		{ dx: DUPLICATE_OFFSET_PX, dy: DUPLICATE_OFFSET_PX },
		img,
	);
	if (moved.x === source.x && moved.y === source.y) {
		moved = moveText(
			source,
			{ dx: -DUPLICATE_OFFSET_PX, dy: -DUPLICATE_OFFSET_PX },
			img,
		);
	}
	return {
		...moved,
		id: newId(),
		createdAt: Date.now(),
		zIndex: initialZIndex("text"),
	};
}
