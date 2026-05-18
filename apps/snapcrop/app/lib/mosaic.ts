/**
 * Mosaic セル合成。各 rect を cellSize × cellSize ブロックに分割し、ブロック内
 * の alpha>0 ピクセルの RGB 平均を取り、その色で塗りつぶす。同じ入力で同じ出力
 * (deterministic — seed なし) を保証する。
 *
 * 入力 ImageData は同一オリジン (Object URL) 前提で getImageData が taint しない。
 * 画像全体のピクセルを 1 回読んで配列インデックスで走査することで、矩形ごとに
 * getImageData を呼ぶよりオーバーヘッドを下げる (重い rect 数 / 大画像での
 * メインスレッド占有を軽減)。
 */

export type MosaicCell = {
	x: number;
	y: number;
	width: number;
	height: number;
	cellSize: number;
};

/**
 * 画像全体のピクセルを 1 つの ImageData として読み出す。失敗 (CORS taint /
 * Context 取得失敗) 時は null。MosaicLayer 側で 1 回だけ呼んで使い回す。
 */
export function readImagePixels(
	img: CanvasImageSource,
	imageWidth: number,
	imageHeight: number,
): ImageData | null {
	const w = Math.max(1, Math.round(imageWidth));
	const h = Math.max(1, Math.round(imageHeight));
	const tmp = document.createElement("canvas");
	tmp.width = w;
	tmp.height = h;
	const ctx = tmp.getContext("2d", { willReadFrequently: true });
	if (!ctx) return null;
	ctx.drawImage(img, 0, 0, w, h);
	try {
		return ctx.getImageData(0, 0, w, h);
	} catch {
		return null;
	}
}

/**
 * 指定した rect 群を mosaic 化し、画像サイズの canvas を返す。mosaic 領域外は
 * transparent。ImageStage 内で <img> の上に重ねて描画する想定。
 */
export function computeMosaicCanvas(
	pixels: ImageData,
	rects: readonly MosaicCell[],
	imageWidth: number,
	imageHeight: number,
): HTMLCanvasElement {
	const out = document.createElement("canvas");
	out.width = Math.max(1, Math.round(imageWidth));
	out.height = Math.max(1, Math.round(imageHeight));
	const outCtx = out.getContext("2d");
	if (!outCtx) return out;

	for (const rect of rects) {
		paintMosaicRect(outCtx, pixels, rect, imageWidth, imageHeight);
	}
	return out;
}

/**
 * 与えられた CanvasRenderingContext2D に対し 1 つの mosaic rect を塗る。
 * computeMosaicCanvas からも、export 時の annotation flatten からも使う。
 */
export function paintMosaicRect(
	outCtx: CanvasRenderingContext2D,
	pixels: ImageData,
	rect: MosaicCell,
	imageWidth: number,
	imageHeight: number,
): void {
	// 画像範囲内に clamp してから走査 (画像外の部分は描かない)
	const sx = Math.max(0, Math.floor(rect.x));
	const sy = Math.max(0, Math.floor(rect.y));
	const ex = Math.min(imageWidth, Math.ceil(rect.x + rect.width));
	const ey = Math.min(imageHeight, Math.ceil(rect.y + rect.height));
	const w = ex - sx;
	const h = ey - sy;
	if (w <= 0 || h <= 0) return;

	const cell = Math.max(1, Math.floor(rect.cellSize));
	const data = pixels.data;
	const stride = pixels.width;

	for (let cy = 0; cy < h; cy += cell) {
		const cellH = Math.min(cell, h - cy);
		for (let cx = 0; cx < w; cx += cell) {
			const cellW = Math.min(cell, w - cx);
			let r = 0;
			let g = 0;
			let b = 0;
			let count = 0;
			for (let py = 0; py < cellH; py++) {
				const rowIdx = ((sy + cy + py) * stride + (sx + cx)) * 4;
				for (let px = 0; px < cellW; px++) {
					const i = rowIdx + px * 4;
					const a = data[i + 3];
					if (a === 0) continue;
					r += data[i];
					g += data[i + 1];
					b += data[i + 2];
					count++;
				}
			}
			if (count === 0) continue;
			const avgR = Math.round(r / count);
			const avgG = Math.round(g / count);
			const avgB = Math.round(b / count);
			outCtx.fillStyle = `rgb(${avgR},${avgG},${avgB})`;
			outCtx.fillRect(sx + cx, sy + cy, cellW, cellH);
		}
	}
}
