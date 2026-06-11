/**
 * 矢印アノテーションを画像座標系 (px) で扱う純粋関数群。React 非依存で、
 * rect-engine.ts と同じ思想 (引数で受け取った annotation を更新した新しい
 * annotation を返す) に揃える。直線 / 曲線 (quadratic bezier)、端点キャップ
 * (なし / 矢印 / 丸) をサポートする。
 */

import type { ImageMetrics } from "~/lib/crop-engine";
import { PRESET_COLORS } from "~/lib/rect-engine";

export type { ImageMetrics };

export type ArrowLineStyle = "straight" | "curve";
export type ArrowCapStyle = "none" | "arrow" | "dot";
export type ArrowThickness = "sm" | "md" | "lg";
export type ArrowEndpoint = "start" | "end";

export type ArrowAnnotation = {
	id: string;
	kind: "arrow";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	line: ArrowLineStyle;
	startCap: ArrowCapStyle;
	endCap: ArrowCapStyle;
	color: string;
	thickness: ArrowThickness;
	createdAt: number;
};

/**
 * updateArrow で書き換えてよいフィールドだけを切り出した patch 型。
 * id / kind / createdAt は不変なので含めない (rect-engine.ts の
 * RectAnnotationPatch と同じ理由)。
 */
export type ArrowAnnotationPatch = Partial<
	Pick<
		ArrowAnnotation,
		| "x1"
		| "y1"
		| "x2"
		| "y2"
		| "line"
		| "startCap"
		| "endCap"
		| "color"
		| "thickness"
	>
>;

export type ArrowDefaults = {
	line: ArrowLineStyle;
	startCap: ArrowCapStyle;
	endCap: ArrowCapStyle;
	color: string;
	thickness: ArrowThickness;
};

export const ARROW_STROKE_PX: Record<ArrowThickness, number> = {
	sm: 2,
	md: 4,
	lg: 8,
};

export const ARROW_HEAD_LEN_PX: Record<ArrowThickness, number> = {
	sm: 10,
	md: 16,
	lg: 26,
};

export const ARROW_DOT_RADIUS_PX: Record<ArrowThickness, number> = {
	sm: 3.5,
	md: 5.5,
	lg: 9,
};

export const DEFAULT_ARROW_DEFAULTS: ArrowDefaults = {
	line: "straight",
	startCap: "none",
	endCap: "arrow",
	color: PRESET_COLORS[0],
	thickness: "md",
};

export const MIN_ARROW_LENGTH = 8;

/** 曲線の膨らみ。中点から法線方向へ「両端点間の距離 × この比率」だけ逃がす。 */
export const CURVE_BULGE_RATIO = 0.18;

export type Point = { x: number; y: number };

export function clampPointInImage(pt: Point, img: ImageMetrics): Point {
	return {
		x: Math.max(0, Math.min(pt.x, img.naturalWidth)),
		y: Math.max(0, Math.min(pt.y, img.naturalHeight)),
	};
}

/** 平行移動。両端点が画像内に収まる範囲まで delta を切り詰める。 */
export function moveArrow(
	a: ArrowAnnotation,
	delta: { dx: number; dy: number },
	img: ImageMetrics,
): ArrowAnnotation {
	const minX = Math.min(a.x1, a.x2);
	const maxX = Math.max(a.x1, a.x2);
	const minY = Math.min(a.y1, a.y2);
	const maxY = Math.max(a.y1, a.y2);
	const dx = Math.max(-minX, Math.min(delta.dx, img.naturalWidth - maxX));
	const dy = Math.max(-minY, Math.min(delta.dy, img.naturalHeight - maxY));
	return { ...a, x1: a.x1 + dx, y1: a.y1 + dy, x2: a.x2 + dx, y2: a.y2 + dy };
}

/**
 * 端点ドラッグ (リサイズ相当)。動かす側の端点を画像内に clamp し、固定側の
 * 端点から MIN_ARROW_LENGTH 未満には縮められない (rect の最小サイズ打ち止め
 * と同じ思想)。
 */
export function moveArrowEndpoint(
	a: ArrowAnnotation,
	endpoint: ArrowEndpoint,
	delta: { dx: number; dy: number },
	img: ImageMetrics,
): ArrowAnnotation {
	const moving =
		endpoint === "start" ? { x: a.x1, y: a.y1 } : { x: a.x2, y: a.y2 };
	const fixed =
		endpoint === "start" ? { x: a.x2, y: a.y2 } : { x: a.x1, y: a.y1 };
	let next = clampPointInImage(
		{ x: moving.x + delta.dx, y: moving.y + delta.dy },
		img,
	);
	const dx = next.x - fixed.x;
	const dy = next.y - fixed.y;
	const len = Math.hypot(dx, dy);
	if (len < MIN_ARROW_LENGTH) {
		// 方向が潰れたら元の向きを使い、固定端点から最小長ぶんだけ離す
		const baseLen = Math.hypot(moving.x - fixed.x, moving.y - fixed.y);
		const ux =
			len > 0 ? dx / len : baseLen > 0 ? (moving.x - fixed.x) / baseLen : 1;
		const uy =
			len > 0 ? dy / len : baseLen > 0 ? (moving.y - fixed.y) / baseLen : 0;
		next = clampPointInImage(
			{
				x: fixed.x + ux * MIN_ARROW_LENGTH,
				y: fixed.y + uy * MIN_ARROW_LENGTH,
			},
			img,
		);
	}
	return endpoint === "start"
		? { ...a, x1: next.x, y1: next.y }
		: { ...a, x2: next.x, y2: next.y };
}

/** rect-engine.ts の newId と同じ。SSR 環境では呼ばれない (UI 操作のみ)。 */
function newId(): string {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}
	// 防御フォールバック (現代ブラウザでは到達しない想定)
	return `arrow_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createArrowAnnotation(args: {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	defaults: ArrowDefaults;
}): ArrowAnnotation {
	return {
		id: newId(),
		kind: "arrow",
		x1: args.x1,
		y1: args.y1,
		x2: args.x2,
		y2: args.y2,
		line: args.defaults.line,
		startCap: args.defaults.startCap,
		endCap: args.defaults.endCap,
		color: args.defaults.color,
		thickness: args.defaults.thickness,
		createdAt: Date.now(),
	};
}

/** quadratic bezier の制御点。直線 (または長さ 0) のときは null。 */
export function arrowControlPoint(a: ArrowAnnotation): Point | null {
	if (a.line !== "curve") return null;
	const dx = a.x2 - a.x1;
	const dy = a.y2 - a.y1;
	if (dx === 0 && dy === 0) return null;
	// 中点 + 単位法線 × (長さ × 比率) = 中点 + (-dy, dx) × 比率
	return {
		x: (a.x1 + a.x2) / 2 - dy * CURVE_BULGE_RATIO,
		y: (a.y1 + a.y2) / 2 + dx * CURVE_BULGE_RATIO,
	};
}

/** hit test 用の折れ線近似。直線は 2 点、曲線は steps 分割でサンプルする。 */
export function arrowPolyline(a: ArrowAnnotation, steps = 24): Point[] {
	const c = arrowControlPoint(a);
	if (!c) {
		return [
			{ x: a.x1, y: a.y1 },
			{ x: a.x2, y: a.y2 },
		];
	}
	const pts: Point[] = [];
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const u = 1 - t;
		pts.push({
			x: u * u * a.x1 + 2 * u * t * c.x + t * t * a.x2,
			y: u * u * a.y1 + 2 * u * t * c.y + t * t * a.y2,
		});
	}
	return pts;
}

function distToSegmentSq(p: Point, v: Point, w: Point): number {
	const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
	if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
	let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
	t = Math.max(0, Math.min(1, t));
	const x = v.x + t * (w.x - v.x);
	const y = v.y + t * (w.y - v.y);
	return (p.x - x) ** 2 + (p.y - y) ** 2;
}

/**
 * createdAt 降順走査 (新しい = 上) で、線分 (曲線は折れ線近似) からの距離が
 * 許容内に入る矢印を返す。baseTolerance は呼び側で zoom を加味した値を渡す
 * (細い線でも掴みやすくするため、太さ由来の許容より小さくはならない)。
 */
export function hitTestArrow(
	arrows: readonly ArrowAnnotation[],
	imgX: number,
	imgY: number,
	baseTolerance = 6,
): ArrowAnnotation | null {
	const p = { x: imgX, y: imgY };
	for (let i = arrows.length - 1; i >= 0; i--) {
		const a = arrows[i];
		const tol = Math.max(baseTolerance, ARROW_STROKE_PX[a.thickness] / 2 + 2);
		const tolSq = tol * tol;
		const pts = arrowPolyline(a);
		for (let j = 0; j < pts.length - 1; j++) {
			if (distToSegmentSq(p, pts[j], pts[j + 1]) <= tolSq) {
				return a;
			}
		}
	}
	return null;
}

export type ArrowCapShape =
	| { type: "arrowhead"; points: [Point, Point, Point] }
	| { type: "dot"; center: Point; radius: number };

/**
 * SVG レイヤー (arrow-layer.tsx) と canvas エクスポート (image-export.ts) が
 * 同じ見た目を共有するための描画モデル。線 (from → to、control があれば
 * quadratic) と、端点キャップの図形リストに分解する。
 */
export type ArrowRenderModel = {
	from: Point;
	to: Point;
	control: Point | null;
	strokeWidth: number;
	caps: ArrowCapShape[];
};

export function getArrowRenderModel(a: ArrowAnnotation): ArrowRenderModel {
	const control = arrowControlPoint(a);
	const from = { x: a.x1, y: a.y1 };
	const to = { x: a.x2, y: a.y2 };
	const caps: ArrowCapShape[] = [];
	pushCap(caps, a.startCap, from, outwardUnit(to, control, from), a.thickness);
	pushCap(caps, a.endCap, to, outwardUnit(from, control, to), a.thickness);
	return { from, to, control, strokeWidth: ARROW_STROKE_PX[a.thickness], caps };
}

/** 端点 tip での「線から外へ抜ける」単位ベクトル。曲線は制御点を接線の基準にする。 */
function outwardUnit(other: Point, control: Point | null, tip: Point): Point {
	const ref = control ?? other;
	const dx = tip.x - ref.x;
	const dy = tip.y - ref.y;
	const len = Math.hypot(dx, dy);
	if (len === 0) return { x: 1, y: 0 };
	return { x: dx / len, y: dy / len };
}

function pushCap(
	caps: ArrowCapShape[],
	style: ArrowCapStyle,
	tip: Point,
	out: Point,
	thickness: ArrowThickness,
): void {
	if (style === "none") return;
	if (style === "dot") {
		caps.push({
			type: "dot",
			center: tip,
			radius: ARROW_DOT_RADIUS_PX[thickness],
		});
		return;
	}
	const len = ARROW_HEAD_LEN_PX[thickness];
	const back = { x: tip.x - out.x * len, y: tip.y - out.y * len };
	const half = len * 0.45;
	const nx = -out.y;
	const ny = out.x;
	caps.push({
		type: "arrowhead",
		points: [
			{ x: tip.x, y: tip.y },
			{ x: back.x + nx * half, y: back.y + ny * half },
			{ x: back.x - nx * half, y: back.y - ny * half },
		],
	});
}
