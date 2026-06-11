/**
 * 手書き風 (Excalidraw 風) の揺らぎパスを生成する純粋関数群。React 非依存。
 *
 * 出力はすべて SVG パスの `d` 文字列。SVG レイヤーは `<path d>` で、canvas
 * 書き出しは `new Path2D(d)` で同じ文字列を描くので、画面と書き出しの見た目が
 * ジオメトリレベルで一致する。揺らぎは seed 付き PRNG (mulberry32) から
 * 決定的に生成し、同じ入力 + 同じ seed なら常に同じパスを返す。
 *
 * rough.js を採用しなかった理由: 必要なのは「線 (直線 / quadratic) を 2 パスで
 * 重ね描く」「多角形 / 円の輪郭を揺らす」だけで、SVG / canvas の両レンダラで
 * 同一出力を保証するには結局 rough.js の内部 opset を自前で paths に変換する
 * 必要があり、依存を増やす利点が薄いため。
 */

export type Point = { x: number; y: number };

/** seed 付きの軽量 PRNG。0 以上 1 未満の一様乱数を決定的な順で返す。 */
export function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** [-amp, amp] の一様乱数。 */
function jitter(rand: () => number, amp: number): number {
	return (rand() * 2 - 1) * amp;
}

/** d 文字列を短く保つための丸め (小数 2 桁)。 */
function fmt(n: number): string {
	return String(Math.round(n * 100) / 100);
}

/** 直線または quadratic bezier 上の点を t (0..1) でサンプルする。 */
function pointAt(
	from: Point,
	to: Point,
	control: Point | null,
	t: number,
): Point {
	if (!control) {
		return {
			x: from.x + (to.x - from.x) * t,
			y: from.y + (to.y - from.y) * t,
		};
	}
	const u = 1 - t;
	return {
		x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
		y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
	};
}

/** 折れ線近似による曲線長。揺らぎの分割数を決めるためなので精度はラフでよい。 */
function approxLength(from: Point, to: Point, control: Point | null): number {
	if (!control) return Math.hypot(to.x - from.x, to.y - from.y);
	let len = 0;
	let prev = from;
	const steps = 16;
	for (let i = 1; i <= steps; i++) {
		const p = pointAt(from, to, control, i / steps);
		len += Math.hypot(p.x - prev.x, p.y - prev.y);
		prev = p;
	}
	return len;
}

/**
 * 揺らした点列を Catmull-Rom スプライン (張力 1/6) で滑らかに通る cubic bezier
 * パスへ変換する。点をそのまま折れ線で結ぶとカクつきが目立つため。
 */
function smoothPathThrough(pts: readonly Point[]): string {
	if (pts.length < 2) return "";
	let d = `M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[Math.max(0, i - 1)];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[Math.min(pts.length - 1, i + 2)];
		const c1x = p1.x + (p2.x - p0.x) / 6;
		const c1y = p1.y + (p2.y - p0.y) / 6;
		const c2x = p2.x - (p3.x - p1.x) / 6;
		const c2y = p2.y - (p3.y - p1.y) / 6;
		d += ` C ${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p2.x)} ${fmt(p2.y)}`;
	}
	return d;
}

/**
 * 線 (直線 or quadratic bezier) を手書き風に揺らした stroke 用パスを返す。
 * rough.js と同じく 2 パス重ね描きで、パスごとに別系列の揺らぎを与えて
 * 「なぞり直した」密度ムラを出す。端点の揺らぎは内部より小さく抑え、
 * 矢頭などのキャップと大きくズレないようにする。
 */
export function sketchyLinePaths(args: {
	from: Point;
	to: Point;
	control: Point | null;
	seed: number;
	amplitude: number;
	passes?: number;
}): string[] {
	const { from, to, control, seed, passes = 2 } = args;
	const len = approxLength(from, to, control);
	if (len === 0) return [];
	// 揺らぎ幅が線長に対して大きすぎると線がのたうつので打ち止め
	const amp = Math.min(args.amplitude, len * 0.2);
	// だいたい 40px ごとに 1 回揺らす。短い線でも最低 3 分割
	const segments = Math.min(16, Math.max(3, Math.round(len / 40)));
	const paths: string[] = [];
	for (let pass = 0; pass < passes; pass++) {
		const rand = mulberry32(seed + pass * 7919);
		const pts: Point[] = [];
		for (let i = 0; i <= segments; i++) {
			const t = i / segments;
			const base = pointAt(from, to, control, t);
			const scale = i === 0 || i === segments ? 0.35 : 1;
			pts.push({
				x: base.x + jitter(rand, amp * scale),
				y: base.y + jitter(rand, amp * scale),
			});
		}
		paths.push(smoothPathThrough(pts));
	}
	return paths;
}

/**
 * 多角形 (矢頭の三角形など) の輪郭を手書き風に揺らした閉パスを返す。
 * 頂点を少し散らし、各辺を「中点を法線方向へ膨らませた quadratic」で結ぶ。
 * fill して使う想定。
 */
export function sketchyPolygonPath(
	points: readonly Point[],
	seed: number,
	amplitude: number,
): string {
	if (points.length < 3) return "";
	const rand = mulberry32(seed);
	const verts = points.map((p) => ({
		x: p.x + jitter(rand, amplitude * 0.6),
		y: p.y + jitter(rand, amplitude * 0.6),
	}));
	let d = `M ${fmt(verts[0].x)} ${fmt(verts[0].y)}`;
	for (let i = 0; i < verts.length; i++) {
		const a = verts[i];
		const b = verts[(i + 1) % verts.length];
		const mx = (a.x + b.x) / 2;
		const my = (a.y + b.y) / 2;
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const elen = Math.hypot(dx, dy);
		// 辺の中点を法線方向に膨らませる。辺が短いときは控えめに
		const bow = jitter(rand, Math.min(amplitude, elen * 0.15));
		const nx = elen > 0 ? -dy / elen : 0;
		const ny = elen > 0 ? dx / elen : 0;
		d += ` Q ${fmt(mx + nx * bow)} ${fmt(my + ny * bow)} ${fmt(b.x)} ${fmt(b.y)}`;
	}
	return `${d} Z`;
}

/** 円弧 1/4 を cubic bezier で描くときの制御点距離係数。 */
const KAPPA = 0.5523;

/**
 * 円 (丸キャップ) を手書き風に揺らした閉パスを返す。アンカー 4 点の半径を
 * それぞれ ±12% 揺らした cubic bezier 4 本で「フリーハンドの丸」を作る。
 * fill して使う想定。
 */
export function sketchyCirclePath(
	center: Point,
	radius: number,
	seed: number,
): string {
	const rand = mulberry32(seed);
	// 0° / 90° / 180° / 270° のアンカー半径を個別に揺らす
	const r = [0, 1, 2, 3].map(() => radius * (1 + jitter(rand, 0.12)));
	const anchors: Point[] = [
		{ x: center.x + r[0], y: center.y },
		{ x: center.x, y: center.y + r[1] },
		{ x: center.x - r[2], y: center.y },
		{ x: center.x, y: center.y - r[3] },
	];
	// 各アンカーでの接線方向 (反時計回りに 90° 回した向き)
	const tangents: Point[] = [
		{ x: 0, y: 1 },
		{ x: -1, y: 0 },
		{ x: 0, y: -1 },
		{ x: 1, y: 0 },
	];
	let d = `M ${fmt(anchors[0].x)} ${fmt(anchors[0].y)}`;
	for (let i = 0; i < 4; i++) {
		const a = anchors[i];
		const b = anchors[(i + 1) % 4];
		const ra = r[i] * KAPPA;
		const rb = r[(i + 1) % 4] * KAPPA;
		const c1 = { x: a.x + tangents[i].x * ra, y: a.y + tangents[i].y * ra };
		const c2 = {
			x: b.x - tangents[(i + 1) % 4].x * rb,
			y: b.y - tangents[(i + 1) % 4].y * rb,
		};
		d += ` C ${fmt(c1.x)} ${fmt(c1.y)} ${fmt(c2.x)} ${fmt(c2.y)} ${fmt(b.x)} ${fmt(b.y)}`;
	}
	return `${d} Z`;
}
