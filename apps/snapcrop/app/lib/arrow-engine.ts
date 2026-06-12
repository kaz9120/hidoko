/**
 * 矢印アノテーションを画像座標系 (px) で扱う純粋関数群。React 非依存で、
 * rect-engine.ts と同じ思想 (引数で受け取った annotation を更新した新しい
 * annotation を返す) に揃える。直線 / 曲線 (quadratic bezier)、端点キャップ
 * (なし / 矢印 / 丸) をサポートする。
 */

import type { ImageMetrics } from "~/lib/crop-engine";
import {
	sketchyCirclePath,
	sketchyLinePaths,
	sketchyPolygonPath,
} from "~/lib/hand-drawn";
import { DUPLICATE_OFFSET_PX, PRESET_COLORS } from "~/lib/rect-engine";

export type { ImageMetrics };

export type ArrowLineStyle = "straight" | "curve";
export type ArrowCapStyle = "none" | "arrow" | "dot";
export type ArrowThickness = "sm" | "md" | "lg";
export type ArrowEndpoint = "start" | "end";
/** 線の質感。clean = きっちりした幾何線、sketchy = 手書き風の揺らぎ線。 */
export type ArrowStrokeStyle = "clean" | "sketchy";

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
	style: ArrowStrokeStyle;
	/**
	 * 手書き風の揺らぎを決める乱数 seed。作成時に 1 度だけ採番し、以後は
	 * 不変 (移動 / 端点ドラッグ / undo / redo / 再描画で形が変わらない)。
	 */
	seed: number;
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
		| "style"
	>
>;

export type ArrowDefaults = {
	line: ArrowLineStyle;
	startCap: ArrowCapStyle;
	endCap: ArrowCapStyle;
	color: string;
	thickness: ArrowThickness;
	style: ArrowStrokeStyle;
};

// キャプション用途では「強調」が命なので、線も矢尻も太めに振る。矢尻は
// 線幅の 4 倍前後の長さ + 開き 0.5 で、遠目にも矢印だと一目で分かる比率。
export const ARROW_STROKE_PX: Record<ArrowThickness, number> = {
	sm: 3,
	md: 6,
	lg: 12,
};

export const ARROW_HEAD_LEN_PX: Record<ArrowThickness, number> = {
	sm: 14,
	md: 26,
	lg: 48,
};

export const ARROW_DOT_RADIUS_PX: Record<ArrowThickness, number> = {
	sm: 5,
	md: 8,
	lg: 14,
};

export const DEFAULT_ARROW_DEFAULTS: ArrowDefaults = {
	line: "straight",
	startCap: "none",
	endCap: "arrow",
	color: PRESET_COLORS[0],
	thickness: "md",
	style: "clean",
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

/**
 * 手書き風の揺らぎに使う seed の採番。描画開始時 (beginDraw) に呼ぶことで、
 * プレビューと commit 後の矢印が同じ形になる。値そのものに意味はなく、
 * 32bit 整数に収まればよい。
 */
export function newArrowSeed(): number {
	return Math.floor(Math.random() * 0x7fffffff);
}

export function createArrowAnnotation(args: {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	defaults: ArrowDefaults;
	/** 省略時は新規採番。プレビューと同じ形を保ちたいときに指定する。 */
	seed?: number;
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
		style: args.defaults.style,
		seed: args.seed ?? newArrowSeed(),
		createdAt: Date.now(),
	};
}

/**
 * annotation を位置を変えずに複製して、新しい id / createdAt を持つコピーを
 * 返す。seed は引き継ぐ (手書き風の揺らぎまで含めて同じ見た目のコピーにする)。
 * Alt+ドラッグ複製の開始時に使う。
 */
export function cloneArrowAnnotation(source: ArrowAnnotation): ArrowAnnotation {
	return { ...source, id: newId(), createdAt: Date.now() };
}

/**
 * annotation を複製して新しい id / createdAt を持つコピーを返す。位置は
 * rect-engine.ts の duplicateRectAnnotation と同じ思想で右下へ
 * DUPLICATE_OFFSET_PX ずらし、画像境界に当たって元と同位置に clamp されて
 * しまう場合は左上方向へフォールバックする。
 */
export function duplicateArrowAnnotation(
	source: ArrowAnnotation,
	img: ImageMetrics,
): ArrowAnnotation {
	let moved = moveArrow(
		source,
		{ dx: DUPLICATE_OFFSET_PX, dy: DUPLICATE_OFFSET_PX },
		img,
	);
	if (moved.x1 === source.x1 && moved.y1 === source.y1) {
		moved = moveArrow(
			source,
			{ dx: -DUPLICATE_OFFSET_PX, dy: -DUPLICATE_OFFSET_PX },
			img,
		);
	}
	return { ...moved, id: newId(), createdAt: Date.now() };
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
 * 手書き風 (style === "sketchy") のときだけ埋まる描画パス。すべて SVG パスの
 * `d` 文字列で、SVG 側は `<path d>`、canvas 側は `new Path2D(d)` で描くことで
 * 画面と書き出しの見た目をジオメトリレベルで一致させる。
 */
export type ArrowSketchyRender = {
	/** 線。stroke する (2 パス重ね描き) */
	linePaths: string[];
	/** キャップ (矢頭 / 丸)。fill する */
	capPaths: string[];
};

/**
 * SVG レイヤー (arrow-layer.tsx) と canvas エクスポート (image-export.ts) が
 * 同じ見た目を共有するための描画モデル。線 (from → to、control があれば
 * quadratic) と、端点キャップの図形リストに分解する。手書き風のときは
 * sketchy に揺らぎ済みのパス文字列が入り、from / to / control / caps の
 * 代わりにそちらを描く。
 */
export type ArrowRenderModel = {
	from: Point;
	to: Point;
	control: Point | null;
	strokeWidth: number;
	caps: ArrowCapShape[];
	sketchy: ArrowSketchyRender | null;
};

export function getArrowRenderModel(a: ArrowAnnotation): ArrowRenderModel {
	const control = arrowControlPoint(a);
	const from = { x: a.x1, y: a.y1 };
	const to = { x: a.x2, y: a.y2 };
	const outStart = outwardUnit(to, control, from);
	const outEnd = outwardUnit(from, control, to);
	const caps: ArrowCapShape[] = [];
	pushCap(caps, a.startCap, from, outStart, a.thickness);
	pushCap(caps, a.endCap, to, outEnd, a.thickness);
	// 矢尻が付く端は、線を頭の中まで引っ込めて頂点から round cap が突き出ない
	// ようにする。引っ込め量は頭長の 8 割 (短い矢印では全長の 4 割で打ち止め)。
	const span = Math.hypot(a.x2 - a.x1, a.y2 - a.y1);
	const inset = Math.min(ARROW_HEAD_LEN_PX[a.thickness] * 0.8, span * 0.4);
	const lineFrom =
		a.startCap === "arrow"
			? { x: from.x - outStart.x * inset, y: from.y - outStart.y * inset }
			: from;
	const lineTo =
		a.endCap === "arrow"
			? { x: to.x - outEnd.x * inset, y: to.y - outEnd.y * inset }
			: to;
	const strokeWidth = ARROW_STROKE_PX[a.thickness];
	return {
		from: lineFrom,
		to: lineTo,
		control,
		strokeWidth,
		caps,
		sketchy:
			a.style === "sketchy"
				? buildSketchyRender(a, lineFrom, lineTo, control, caps, strokeWidth)
				: null,
	};
}

/**
 * 手書き風の揺らぎパスを組み立てる。揺らぎ幅は線幅に比例させ (細い線ほど
 * 控えめ)、キャップは caps の幾何 (clean と同じ頂点 / 半径) を seed 違いで
 * 揺らす。同じ annotation (= 同じ seed) なら常に同じパスを返す。
 */
function buildSketchyRender(
	a: ArrowAnnotation,
	lineFrom: Point,
	lineTo: Point,
	control: Point | null,
	caps: readonly ArrowCapShape[],
	strokeWidth: number,
): ArrowSketchyRender {
	const amplitude = Math.max(1.25, strokeWidth * 0.35);
	const linePaths = sketchyLinePaths({
		from: lineFrom,
		to: lineTo,
		control,
		seed: a.seed,
		amplitude,
	});
	const capPaths = caps.map((cap, i) => {
		// start / end で別系列の揺らぎになるよう seed をずらす
		const capSeed = a.seed + (i + 1) * 7717;
		if (cap.type === "arrowhead") {
			const capAmp = Math.max(1, ARROW_HEAD_LEN_PX[a.thickness] * 0.06);
			return sketchyPolygonPath(cap.points, capSeed, capAmp);
		}
		return sketchyCirclePath(cap.center, cap.radius, capSeed);
	});
	return { linePaths, capPaths };
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
	const half = len * 0.5;
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
