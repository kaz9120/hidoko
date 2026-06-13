/**
 * 矩形アノテーションを画像座標系 (px) で扱う純粋関数群。React 非依存で、
 * 引数で受け取った annotation を更新した新しい annotation を返す。
 */

import { initialZIndex } from "~/lib/annotation-z-order";
import {
	type ImageMetrics,
	type ResizeHandle,
	resizeRect,
} from "~/lib/crop-engine";
import { sketchyLinePaths } from "~/lib/hand-drawn";

export type { ImageMetrics, ResizeHandle };

export type RectStyle = "outline" | "fill" | "mosaic";
export type RectThickness = "sm" | "md" | "lg";
/** 線の質感。clean = きっちりした幾何線、sketchy = 手書き風の揺らぎ線。 */
export type RectStrokeStyle = "clean" | "sketchy";

export type RectAnnotation = {
	id: string;
	kind: "rect";
	x: number;
	y: number;
	width: number;
	height: number;
	style: RectStyle;
	color: string;
	thickness: RectThickness;
	/**
	 * 枠線の質感。outline スタイルの矩形にのみ効く。fill / mosaic では描画上
	 * 無視される (枠線が無いので)。arrow-engine の ArrowAnnotation.style と
	 * 同じ概念を、矩形側では既存の `style` (outline/fill/mosaic) と衝突しない
	 * よう `strokeStyle` 名で持つ。
	 */
	strokeStyle: RectStrokeStyle;
	/**
	 * 手書き風の揺らぎを決める乱数 seed。作成時に 1 度だけ採番し、以後は
	 * 不変 (移動 / リサイズ / undo / redo / 再描画で形が変わらない)。
	 */
	seed: number;
	createdAt: number;
	/** 種別横断の重なり順 (annotation-z-order.ts)。大きいほど前面。 */
	zIndex: number;
};

export type Annotation = RectAnnotation;

/**
 * updateAnnotation で書き換えてよいフィールドだけを切り出した patch 型。
 * id / kind / createdAt は不変なので含めない (履歴オペレーションの同一性が
 * 崩れないようにする)。zIndex は z 操作 (前面へ / 背面へ) が書き換える。
 * seed も不変 (見た目が描き直しで揺れないようにするため)。
 */
export type RectAnnotationPatch = Partial<
	Pick<
		RectAnnotation,
		| "x"
		| "y"
		| "width"
		| "height"
		| "style"
		| "color"
		| "thickness"
		| "strokeStyle"
		| "zIndex"
	>
>;

export type RectDefaults = {
	style: RectStyle;
	color: string;
	thickness: RectThickness;
	strokeStyle: RectStrokeStyle;
};

export const OUTLINE_PX: Record<RectThickness, number> = {
	sm: 2,
	md: 4,
	lg: 8,
};

export const MOSAIC_PX: Record<RectThickness, number> = {
	sm: 8,
	md: 12,
	lg: 20,
};

export const PRESET_COLORS = [
	"#ef4444",
	"#f47d3a",
	"#facc15",
	"#22c55e",
	"#3b82f6",
	"#ffffff",
] as const;

export const DEFAULT_RECT_DEFAULTS: RectDefaults = {
	style: "outline",
	color: "#ef4444",
	thickness: "md",
	strokeStyle: "clean",
};

export const FILL_OPACITY = 0.85;
export const MIN_RECT_SIZE = 4;

type Rect = { x: number; y: number; width: number; height: number };
type Point = { x: number; y: number };

/** rect を画像内に収め、最小サイズ MIN_RECT_SIZE を満たすよう調整する。 */
export function clampRectInImage(rect: Rect, img: ImageMetrics): Rect {
	const maxW = img.naturalWidth;
	const maxH = img.naturalHeight;
	const minW = Math.min(MIN_RECT_SIZE, maxW);
	const minH = Math.min(MIN_RECT_SIZE, maxH);
	const width = Math.max(minW, Math.min(rect.width, maxW));
	const height = Math.max(minH, Math.min(rect.height, maxH));
	const x = Math.max(0, Math.min(rect.x, maxW - width));
	const y = Math.max(0, Math.min(rect.y, maxH - height));
	return { x, y, width, height };
}

/** 描画途中の preview rect を画像内に切り詰めて返す。w/h は 0 を許容する (4px 未満判定は呼び側)。 */
export function normalizeDrawingRect(
	start: { x: number; y: number },
	current: { x: number; y: number },
	img: ImageMetrics,
): Rect {
	const x = Math.max(0, Math.min(start.x, current.x, img.naturalWidth));
	const y = Math.max(0, Math.min(start.y, current.y, img.naturalHeight));
	const right = Math.min(Math.max(start.x, current.x), img.naturalWidth);
	const bottom = Math.min(Math.max(start.y, current.y), img.naturalHeight);
	return {
		x,
		y,
		width: Math.max(0, right - x),
		height: Math.max(0, bottom - y),
	};
}

export function moveAnnotation(
	a: RectAnnotation,
	delta: { dx: number; dy: number },
	img: ImageMetrics,
): RectAnnotation {
	const next = clampRectInImage(
		{ x: a.x + delta.dx, y: a.y + delta.dy, width: a.width, height: a.height },
		img,
	);
	return { ...a, ...next };
}

/**
 * ハンドルドラッグでリサイズ。通常は aspectRatio 拘束なしで、最小サイズに
 * 当たったらアンカー側を維持して打ち止める (比率なしの crop-engine.ts と同じ
 * 思想)。keepAspect (= Shift ドラッグ) のときはドラッグ開始時の縦横比を
 * 維持してリサイズする — 比率追従・境界・最小サイズの reconcile は
 * crop-engine の resizeRect に委譲する。
 */
export function resizeAnnotation(
	a: RectAnnotation,
	handle: ResizeHandle,
	delta: { dx: number; dy: number },
	img: ImageMetrics,
	keepAspect = false,
): RectAnnotation {
	if (keepAspect) {
		const next = resizeRect(
			{ x: a.x, y: a.y, width: a.width, height: a.height },
			handle,
			delta,
			{ aspectRatio: a.width / a.height, img, minSize: MIN_RECT_SIZE },
		);
		return { ...a, ...next };
	}
	const hasN = handle.includes("n");
	const hasS = handle.includes("s");
	const hasE = handle.includes("e");
	const hasW = handle.includes("w");

	let x = a.x;
	let y = a.y;
	let width = a.width;
	let height = a.height;

	if (hasE) width = a.width + delta.dx;
	if (hasW) {
		width = a.width - delta.dx;
		x = a.x + delta.dx;
	}
	if (hasS) height = a.height + delta.dy;
	if (hasN) {
		height = a.height - delta.dy;
		y = a.y + delta.dy;
	}

	// 画像境界
	if (hasW && x < 0) {
		width = a.x + a.width;
		x = 0;
	}
	if (hasE && x + width > img.naturalWidth) {
		width = img.naturalWidth - a.x;
		x = a.x;
	}
	if (hasN && y < 0) {
		height = a.y + a.height;
		y = 0;
	}
	if (hasS && y + height > img.naturalHeight) {
		height = img.naturalHeight - a.y;
		y = a.y;
	}

	// 最小サイズ — アンカー側を維持
	if (width < MIN_RECT_SIZE) {
		if (hasW) x = a.x + a.width - MIN_RECT_SIZE;
		width = MIN_RECT_SIZE;
	}
	if (height < MIN_RECT_SIZE) {
		if (hasN) y = a.y + a.height - MIN_RECT_SIZE;
		height = MIN_RECT_SIZE;
	}

	return { ...a, ...clampRectInImage({ x, y, width, height }, img) };
}

/** 起動済の crypto.randomUUID を使う。SSR 環境では呼ばれない (UI 操作のみ)。 */
function newId(): string {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}
	// 防御フォールバック (現代ブラウザでは到達しない想定)
	return `rect_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 手書き風の揺らぎに使う seed の採番。arrow-engine.ts の newArrowSeed と
 * 同じ流儀。描画開始時 (beginDraw) に呼ぶことで、プレビューと commit 後の
 * 矩形が同じ形になる。値そのものに意味はなく、32bit 整数に収まればよい。
 */
export function newRectSeed(): number {
	return Math.floor(Math.random() * 0x7fffffff);
}

export function createRectAnnotation(args: {
	x: number;
	y: number;
	width: number;
	height: number;
	defaults: RectDefaults;
	/** 省略時は新規採番。プレビューと同じ形を保ちたいときに指定する。 */
	seed?: number;
}): RectAnnotation {
	return {
		id: newId(),
		kind: "rect",
		x: args.x,
		y: args.y,
		width: args.width,
		height: args.height,
		style: args.defaults.style,
		color: args.defaults.color,
		thickness: args.defaults.thickness,
		strokeStyle: args.defaults.strokeStyle,
		seed: args.seed ?? newRectSeed(),
		createdAt: Date.now(),
		zIndex: initialZIndex("rect"),
	};
}

/** 複製時に元注釈からずらす距離 (画像 px)。全種別の duplicate* で共有する。 */
export const DUPLICATE_OFFSET_PX = 16;

/**
 * annotation を位置を変えずに複製して、新しい id / createdAt / zIndex を持つ
 * コピーを返す。Alt+ドラッグ複製の開始時 (コピーをその場に作ってドラッグへ
 * 繋ぐ) に使う。zIndex は新規作成と同じ採番なので、コピーは同種別の最前面に
 * 乗る。
 */
export function cloneRectAnnotation(source: RectAnnotation): RectAnnotation {
	return {
		...source,
		id: newId(),
		createdAt: Date.now(),
		zIndex: initialZIndex("rect"),
	};
}

/**
 * annotation を複製して新しい id / createdAt を持つコピーを返す。位置は
 * 右下へ DUPLICATE_OFFSET_PX ずらし、画像境界に当たって元と同位置に
 * clamp されてしまう場合は左上方向へフォールバックする (重なって
 * 複製に気づけない事態を避ける)。
 */
export function duplicateRectAnnotation(
	source: RectAnnotation,
	img: ImageMetrics,
): RectAnnotation {
	const size = { width: source.width, height: source.height };
	let placed = clampRectInImage(
		{
			x: source.x + DUPLICATE_OFFSET_PX,
			y: source.y + DUPLICATE_OFFSET_PX,
			...size,
		},
		img,
	);
	if (placed.x === source.x && placed.y === source.y) {
		placed = clampRectInImage(
			{
				x: source.x - DUPLICATE_OFFSET_PX,
				y: source.y - DUPLICATE_OFFSET_PX,
				...size,
			},
			img,
		);
	}
	return {
		...cloneRectAnnotation(source),
		x: placed.x,
		y: placed.y,
		width: placed.width,
		height: placed.height,
	};
}

/** createdAt 降順走査 (新しい = 上) で先頭一致の annotation を返す。 */
export function hitTest(
	annotations: readonly RectAnnotation[],
	imgX: number,
	imgY: number,
): RectAnnotation | null {
	for (let i = annotations.length - 1; i >= 0; i--) {
		const a = annotations[i];
		if (
			imgX >= a.x &&
			imgX <= a.x + a.width &&
			imgY >= a.y &&
			imgY <= a.y + a.height
		) {
			return a;
		}
	}
	return null;
}

/**
 * outline + sketchy の矩形を「4 辺 × 2 パス」の揺らぎ stroke パスに分解する。
 * 各辺で別系列の seed を使い、辺ごとに「なぞり直した」密度ムラを出す。
 * fill="none" stroke で描く想定。SVG / canvas で同じ d 文字列を共有するので、
 * 画面と書き出しの見た目がジオメトリレベルで一致する (arrow-engine の
 * buildSketchyRender と同じ思想)。
 */
export function sketchyRectStrokePaths(args: {
	x: number;
	y: number;
	width: number;
	height: number;
	seed: number;
	strokeWidth: number;
}): string[] {
	const { x, y, width, height, seed, strokeWidth } = args;
	// 短辺が小さいほど揺らぎは控えめに。線幅にも追従させる。
	const span = Math.min(width, height);
	const amplitude = Math.min(
		Math.max(1.25, strokeWidth * 0.45),
		Math.max(1.5, span * 0.06),
	);
	const corners: Array<{ from: Point; to: Point }> = [
		{ from: { x, y }, to: { x: x + width, y } },
		{ from: { x: x + width, y }, to: { x: x + width, y: y + height } },
		{ from: { x: x + width, y: y + height }, to: { x, y: y + height } },
		{ from: { x, y: y + height }, to: { x, y } },
	];
	const paths: string[] = [];
	for (let i = 0; i < corners.length; i++) {
		const { from, to } = corners[i];
		// 辺ごとに seed をずらして別系列の揺らぎを与える
		const edgePaths = sketchyLinePaths({
			from,
			to,
			control: null,
			seed: seed + (i + 1) * 6151,
			amplitude,
		});
		paths.push(...edgePaths);
	}
	return paths;
}
