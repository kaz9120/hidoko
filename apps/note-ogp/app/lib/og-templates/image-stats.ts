import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────
// 写真の輝度統計 — 台紙の意匠を自動で決めるための材料
//
// 写真を 64x34（1280x670 とほぼ同じ比率）に縮小し、画素ごとの輝度と
// 平均色だけを持つ。台紙はここから「タイトル領域の明るさ」を引き、
// 文字色・スクリム・ハロを自分で決める。ユーザーは判断しない。
// ─────────────────────────────────────────────────────────

const SAMPLE_W = 64;
const SAMPLE_H = 34;

/** 台紙内の矩形。値は 0..1 の正規化座標（左上原点） */
export type Region = {
	x: number;
	y: number;
	w: number;
	h: number;
};

/**
 * 縮小画像の統計。canvas が汚染された場合や読み込みに失敗した場合は
 * `ok: false` になる。台紙は成立させたいので、呼び出し側は既定値へ逃がす。
 */
export type ImageStats =
	| {
			ok: true;
			/** SAMPLE_W * SAMPLE_H 個の輝度（0..1）。走査は y * SAMPLE_W + x */
			lum: Float32Array;
			/** 平均色 [r, g, b]（0..255） */
			avg: readonly [number, number, number];
	  }
	| { ok: false };

/**
 * 写真を縮小して輝度マップと平均色を取る。src が変わるたびに再計測し、
 * 途中で差し替えられた場合は前の結果を捨てる。
 *
 * 写真が未設定なら null を返す。読み込みや getImageData に失敗した場合も
 * null ではなく `{ ok: false }` を返し、「試したが取れなかった」を区別できる
 * ようにする。
 */
export function useImageStats(
	src: string | null | undefined,
): ImageStats | null {
	const [stats, setStats] = useState<ImageStats | null>(null);

	useEffect(() => {
		if (!src) {
			setStats(null);
			return;
		}
		let canceled = false;
		const img = new Image();
		img.onload = () => {
			if (canceled) return;
			setStats(measure(img));
		};
		img.onerror = () => {
			if (!canceled) setStats({ ok: false });
		};
		img.src = src;
		return () => {
			canceled = true;
		};
	}, [src]);

	return stats;
}

/** 読み込み済み画像を 64x34 に描いて輝度と平均色を集計する */
function measure(img: HTMLImageElement): ImageStats {
	try {
		const canvas = document.createElement("canvas");
		canvas.width = SAMPLE_W;
		canvas.height = SAMPLE_H;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) return { ok: false };
		ctx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
		// dataURL 以外の写真では canvas が汚染され、ここが SecurityError で落ちる
		const data = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data;
		const n = SAMPLE_W * SAMPLE_H;
		const lum = new Float32Array(n);
		let rs = 0;
		let gs = 0;
		let bs = 0;
		for (let i = 0; i < n; i++) {
			const r = data[i * 4];
			const g = data[i * 4 + 1];
			const b = data[i * 4 + 2];
			// ITU-R BT.709 の相対輝度。人の目の感度に合わせて緑を重く見る
			lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
			rs += r;
			gs += g;
			bs += b;
		}
		return { ok: true, lum, avg: [rs / n, gs / n, bs / n] };
	} catch {
		return { ok: false };
	}
}

/** 正規化矩形を縮小画像の画素範囲に丸める */
function pixelBounds(r: Region) {
	return {
		x0: Math.max(0, Math.floor(r.x * SAMPLE_W)),
		x1: Math.min(SAMPLE_W, Math.ceil((r.x + r.w) * SAMPLE_W)),
		y0: Math.max(0, Math.floor(r.y * SAMPLE_H)),
		y1: Math.min(SAMPLE_H, Math.ceil((r.y + r.h) * SAMPLE_H)),
	};
}

/**
 * 領域の平均輝度。統計が取れていないときは 0.22（暗い写真）を返す。
 * 既定の台紙は暗い写真を前提にオフ白で組むので、そこへ寄せるのが安全。
 */
export function regionMean(stats: ImageStats | null, region: Region): number {
	if (!stats?.ok) return 0.22;
	const { x0, x1, y0, y1 } = pixelBounds(region);
	let sum = 0;
	let n = 0;
	for (let y = y0; y < y1; y++) {
		for (let x = x0; x < x1; x++) {
			sum += stats.lum[y * SAMPLE_W + x];
			n++;
		}
	}
	return n ? sum / n : 0.22;
}

/** 領域の平均輝度と標準偏差。標準偏差が低いほど「平坦な面」 */
function regionStats(lum: Float32Array, region: Region) {
	const { x0, x1, y0, y1 } = pixelBounds(region);
	let sum = 0;
	let n = 0;
	for (let y = y0; y < y1; y++) {
		for (let x = x0; x < x1; x++) {
			sum += lum[y * SAMPLE_W + x];
			n++;
		}
	}
	// 空の領域は「評価できない」ので、平坦さ最悪（std=1）として候補から落とす
	if (!n) return { mean: 0.5, std: 1 };
	const mean = sum / n;
	let variance = 0;
	for (let y = y0; y < y1; y++) {
		for (let x = x0; x < x1; x++) {
			const d = lum[y * SAMPLE_W + x] - mean;
			variance += d * d;
		}
	}
	return { mean, std: Math.sqrt(variance / n) };
}

export const QUIET_REGION_IDS = ["bl", "br", "tr", "cl", "cr", "rcol"] as const;
export type QuietRegionId = (typeof QUIET_REGION_IDS)[number];

/** 自動配置の候補領域。面積をほぼ揃えてあるので、位置が変わっても文字の大きさは揃う */
export type QuietRegion = Region & {
	id: QuietRegionId;
	align: "left" | "right";
};

export const QUIET_REGIONS: readonly QuietRegion[] = [
	{ id: "bl", x: 0.044, y: 0.5, w: 0.58, h: 0.34, align: "left" },
	{ id: "br", x: 0.376, y: 0.5, w: 0.58, h: 0.34, align: "right" },
	{ id: "tr", x: 0.376, y: 0.09, w: 0.58, h: 0.34, align: "right" },
	{ id: "cl", x: 0.044, y: 0.3, w: 0.52, h: 0.38, align: "left" },
	{ id: "cr", x: 0.436, y: 0.3, w: 0.52, h: 0.38, align: "left" },
	{ id: "rcol", x: 0.62, y: 0.1, w: 0.34, h: 0.78, align: "left" },
];

const DEFAULT_QUIET_REGION: QuietRegion = QUIET_REGIONS[0];

/** マストヘッドが占める矩形。ここと重なる候補は減点する */
const MASTHEAD_BOX: Region = { x: 0.03, y: 0.05, w: 0.42, h: 0.26 };

/** a の面積に対する重なりの割合 */
function overlapRatio(a: Region, b: Region): number {
	const ox = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
	const oy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
	return (ox * oy) / (a.w * a.h);
}

export type QuietPickOptions = {
	/** マストヘッドと重なる候補を減点する */
	avoidMasthead?: boolean;
	/** 縦組み用の右柱（rcol）を候補から外す */
	excludeVertical?: boolean;
};

export type QuietPick = {
	region: QuietRegion;
	mean: number;
	std: number;
	/** 統計が取れず既定領域へ逃げたか */
	fallback: boolean;
};

/**
 * 写真の中でいちばん「静かな面」を選ぶ。平坦さ（標準偏差の低さ）を主、
 * 明暗の振り切れ具合を従で評価する。参照した雑誌は暗幕を敷かず、写真の
 * もともと静かな部分に文字を置いていた。
 *
 * 統計が取れないときは左下（bl）へ逃げ、暗い面を前提にした値を返す。
 */
export function pickQuietRegion(
	stats: ImageStats | null,
	options: QuietPickOptions = {},
): QuietPick {
	if (!stats?.ok) {
		return {
			region: DEFAULT_QUIET_REGION,
			mean: 0.2,
			std: 0.1,
			fallback: true,
		};
	}

	let best: QuietPick | null = null;
	let bestScore = Number.POSITIVE_INFINITY;
	for (const region of QUIET_REGIONS) {
		if (options.excludeVertical && region.id === "rcol") continue;
		const s = regionStats(stats.lum, region);
		// 平坦なほど良い。中間調（0.5 付近）は文字色が決めにくいので減点する
		let score = s.std - 0.28 * Math.abs(s.mean - 0.5);
		if (options.avoidMasthead) {
			score += overlapRatio(region, MASTHEAD_BOX) * 0.42;
		}
		if (score < bestScore) {
			bestScore = score;
			best = { region, mean: s.mean, std: s.std, fallback: false };
		}
	}

	// excludeVertical で全候補を除外することはない（rcol 以外が 5 つ残る）が、
	// 型の上では起こりうるので既定へ逃がす
	return (
		best ?? {
			region: DEFAULT_QUIET_REGION,
			mean: 0.2,
			std: 0.1,
			fallback: true,
		}
	);
}
