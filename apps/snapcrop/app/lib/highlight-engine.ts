/**
 * マーカー (ハイライト) アノテーションを画像座標系 (px) で扱う純粋関数群。
 * React 非依存で、arrow-engine.ts と同じ思想 (引数で受け取った annotation を
 * 更新した新しい annotation を返す) に揃える。形状は矢印と同じ「2 点ドラッグの
 * 線分 + 太さ」で、蛍光ペンの帯として描く。重ね味は multiply 合成
 * (CSS は mix-blend-mode、canvas は globalCompositeOperation) で、
 * 下の文字が透ける。
 */

import { initialZIndex } from "~/lib/annotation-z-order";
import type { ImageMetrics } from "~/lib/crop-engine";
import { sketchyLinePaths } from "~/lib/hand-drawn";
import { DUPLICATE_OFFSET_PX } from "~/lib/rect-engine";

export type { ImageMetrics };

export type HighlightThickness = "sm" | "md" | "lg";
export type HighlightEndpoint = "start" | "end";
/** マーカーの質感。clean = 直線の帯、sketchy = 手書き風に揺らいだ帯。 */
export type HighlightStrokeStyle = "clean" | "sketchy";

export type HighlightAnnotation = {
	id: string;
	kind: "highlight";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	/** 0–1。multiply 合成と組み合わせて「下が透ける」濃度を決める。 */
	opacity: number;
	thickness: HighlightThickness;
	/**
	 * 帯の質感。arrow-engine の ArrowAnnotation.style / rect-engine の
	 * RectAnnotation.strokeStyle と同じ概念。マーカーは「線分 + 帯幅」だけ
	 * なので衝突する既存フィールドはないが、矩形と命名を揃える。
	 */
	strokeStyle: HighlightStrokeStyle;
	/** 手書き風の揺らぎを決める乱数 seed。作成時に 1 度だけ採番し、以後は不変。 */
	seed: number;
	createdAt: number;
	/** 種別横断の重なり順 (annotation-z-order.ts)。大きいほど前面。 */
	zIndex: number;
};

/**
 * updateHighlight で書き換えてよいフィールドだけを切り出した patch 型。
 * id / kind / createdAt / seed は不変なので含めない (arrow-engine.ts の
 * ArrowAnnotationPatch と同じ理由)。
 */
export type HighlightAnnotationPatch = Partial<
	Pick<
		HighlightAnnotation,
		| "x1"
		| "y1"
		| "x2"
		| "y2"
		| "color"
		| "opacity"
		| "thickness"
		| "strokeStyle"
		| "zIndex"
	>
>;

export type HighlightDefaults = {
	color: string;
	opacity: number;
	thickness: HighlightThickness;
	strokeStyle: HighlightStrokeStyle;
};

/** マーカー帯の太さ。文字 1 行を覆える程度を md とする。 */
export const HIGHLIGHT_BAND_PX: Record<HighlightThickness, number> = {
	sm: 12,
	md: 20,
	lg: 32,
};

/**
 * 蛍光ペンのプリセット 5 色 (黄 / 橙 / 緑 / 青 / ピンク)。
 * 矩形・矢印の共通プリセット (PRESET_COLORS) とは別物で、multiply 合成でも
 * 下の文字が読める明るめの色を選ぶ。
 */
export const HIGHLIGHT_PRESET_COLORS = [
	"#fde047", // 黄
	"#fdba74", // 橙
	"#bef264", // 緑
	"#93c5fd", // 青
	"#f9a8d4", // ピンク
] as const;

export const HIGHLIGHT_MIN_OPACITY = 0.1;
export const HIGHLIGHT_MAX_OPACITY = 1;

export const DEFAULT_HIGHLIGHT_DEFAULTS: HighlightDefaults = {
	color: HIGHLIGHT_PRESET_COLORS[0],
	opacity: 0.4,
	thickness: "md",
	strokeStyle: "clean",
};

export const MIN_HIGHLIGHT_LENGTH = 8;

export type Point = { x: number; y: number };

export function clampPointInImage(pt: Point, img: ImageMetrics): Point {
	return {
		x: Math.max(0, Math.min(pt.x, img.naturalWidth)),
		y: Math.max(0, Math.min(pt.y, img.naturalHeight)),
	};
}

/** 平行移動。両端点が画像内に収まる範囲まで delta を切り詰める (arrow と同じ)。 */
export function moveHighlight(
	h: HighlightAnnotation,
	delta: { dx: number; dy: number },
	img: ImageMetrics,
): HighlightAnnotation {
	const minX = Math.min(h.x1, h.x2);
	const maxX = Math.max(h.x1, h.x2);
	const minY = Math.min(h.y1, h.y2);
	const maxY = Math.max(h.y1, h.y2);
	const dx = Math.max(-minX, Math.min(delta.dx, img.naturalWidth - maxX));
	const dy = Math.max(-minY, Math.min(delta.dy, img.naturalHeight - maxY));
	return { ...h, x1: h.x1 + dx, y1: h.y1 + dy, x2: h.x2 + dx, y2: h.y2 + dy };
}

/**
 * 端点ドラッグ (リサイズ相当)。動かす側の端点を画像内に clamp し、固定側の
 * 端点から MIN_HIGHLIGHT_LENGTH 未満には縮められない (arrow-engine.ts の
 * moveArrowEndpoint と同じ思想)。
 */
export function moveHighlightEndpoint(
	h: HighlightAnnotation,
	endpoint: HighlightEndpoint,
	delta: { dx: number; dy: number },
	img: ImageMetrics,
): HighlightAnnotation {
	const moving =
		endpoint === "start" ? { x: h.x1, y: h.y1 } : { x: h.x2, y: h.y2 };
	const fixed =
		endpoint === "start" ? { x: h.x2, y: h.y2 } : { x: h.x1, y: h.y1 };
	let next = clampPointInImage(
		{ x: moving.x + delta.dx, y: moving.y + delta.dy },
		img,
	);
	const dx = next.x - fixed.x;
	const dy = next.y - fixed.y;
	const len = Math.hypot(dx, dy);
	if (len < MIN_HIGHLIGHT_LENGTH) {
		// 方向が潰れたら元の向きを使い、固定端点から最小長ぶんだけ離す
		const baseLen = Math.hypot(moving.x - fixed.x, moving.y - fixed.y);
		const ux =
			len > 0 ? dx / len : baseLen > 0 ? (moving.x - fixed.x) / baseLen : 1;
		const uy =
			len > 0 ? dy / len : baseLen > 0 ? (moving.y - fixed.y) / baseLen : 0;
		next = clampPointInImage(
			{
				x: fixed.x + ux * MIN_HIGHLIGHT_LENGTH,
				y: fixed.y + uy * MIN_HIGHLIGHT_LENGTH,
			},
			img,
		);
	}
	return endpoint === "start"
		? { ...h, x1: next.x, y1: next.y }
		: { ...h, x2: next.x, y2: next.y };
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
	return `highlight_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 手書き風の揺らぎに使う seed の採番。arrow-engine.ts の newArrowSeed と
 * 同じ流儀。値そのものに意味はなく、32bit 整数に収まればよい。
 */
export function newHighlightSeed(): number {
	return Math.floor(Math.random() * 0x7fffffff);
}

export function createHighlightAnnotation(args: {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	defaults: HighlightDefaults;
	/** 省略時は新規採番。プレビューと同じ形を保ちたいときに指定する。 */
	seed?: number;
}): HighlightAnnotation {
	return {
		id: newId(),
		kind: "highlight",
		x1: args.x1,
		y1: args.y1,
		x2: args.x2,
		y2: args.y2,
		color: args.defaults.color,
		opacity: args.defaults.opacity,
		thickness: args.defaults.thickness,
		strokeStyle: args.defaults.strokeStyle,
		seed: args.seed ?? newHighlightSeed(),
		createdAt: Date.now(),
		zIndex: initialZIndex("highlight"),
	};
}

/**
 * annotation を位置を変えずに複製して、新しい id / createdAt / zIndex を持つ
 * コピーを返す。Alt+ドラッグ複製の開始時に使う。
 */
export function cloneHighlightAnnotation(
	source: HighlightAnnotation,
): HighlightAnnotation {
	return {
		...source,
		id: newId(),
		createdAt: Date.now(),
		zIndex: initialZIndex("highlight"),
	};
}

/**
 * annotation を複製して新しい id / createdAt を持つコピーを返す。位置は
 * rect-engine.ts の duplicateRectAnnotation と同じ思想で右下へ
 * DUPLICATE_OFFSET_PX ずらし、画像境界に当たって元と同位置に clamp されて
 * しまう場合は左上方向へフォールバックする。
 */
export function duplicateHighlightAnnotation(
	source: HighlightAnnotation,
	img: ImageMetrics,
): HighlightAnnotation {
	let moved = moveHighlight(
		source,
		{ dx: DUPLICATE_OFFSET_PX, dy: DUPLICATE_OFFSET_PX },
		img,
	);
	if (moved.x1 === source.x1 && moved.y1 === source.y1) {
		moved = moveHighlight(
			source,
			{ dx: -DUPLICATE_OFFSET_PX, dy: -DUPLICATE_OFFSET_PX },
			img,
		);
	}
	return {
		...moved,
		id: newId(),
		createdAt: Date.now(),
		zIndex: initialZIndex("highlight"),
	};
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
 * createdAt 降順走査 (新しい = 上) で、線分からの距離が帯の半分 + 余白に
 * 入るハイライトを返す。baseTolerance は呼び側で zoom を加味した値を渡す
 * (hitTestArrow と同じ流儀。帯が太いぶん、実質は帯由来の許容が効く)。
 */
export function hitTestHighlight(
	highlights: readonly HighlightAnnotation[],
	imgX: number,
	imgY: number,
	baseTolerance = 6,
): HighlightAnnotation | null {
	const p = { x: imgX, y: imgY };
	for (let i = highlights.length - 1; i >= 0; i--) {
		const h = highlights[i];
		const tol = Math.max(baseTolerance, HIGHLIGHT_BAND_PX[h.thickness] / 2 + 2);
		if (
			distToSegmentSq(p, { x: h.x1, y: h.y1 }, { x: h.x2, y: h.y2 }) <=
			tol * tol
		) {
			return h;
		}
	}
	return null;
}

/**
 * SVG レイヤー (highlight-layer.tsx) と canvas エクスポート (image-export.ts)
 * が同じ見た目を共有するための描画モデル。線分 + 帯幅 + 色 + 不透明度に
 * 分解する。両者とも multiply 合成・butt cap で描くこと。手書き風 (sketchy)
 * のときは sketchy に揺らぎ済みのパス文字列が入り、from / to の代わりに
 * これを strokeWidth = bandWidth で描く。
 */
export type HighlightRenderModel = {
	from: Point;
	to: Point;
	bandWidth: number;
	color: string;
	opacity: number;
	sketchy: { linePaths: string[] } | null;
};

export function getHighlightRenderModel(
	h: HighlightAnnotation,
): HighlightRenderModel {
	const from = { x: h.x1, y: h.y1 };
	const to = { x: h.x2, y: h.y2 };
	const bandWidth = HIGHLIGHT_BAND_PX[h.thickness];
	return {
		from,
		to,
		bandWidth,
		color: h.color,
		opacity: h.opacity,
		sketchy:
			h.strokeStyle === "sketchy"
				? {
						linePaths: sketchyLinePaths({
							from,
							to,
							control: null,
							seed: h.seed,
							// 帯幅の 12% を揺らぎ幅にする。bandWidth が大きいので、線の
							// 揺らぎ (arrow と同じ 0.35 比) ではなく小さめに抑える。
							amplitude: Math.max(1.5, bandWidth * 0.12),
						}),
					}
				: null,
	};
}
