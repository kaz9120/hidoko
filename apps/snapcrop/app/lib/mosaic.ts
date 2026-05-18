/**
 * Mosaic セル合成。各 rect を cellSize × cellSize ブロックに分割し、ブロック内
 * の alpha>0 ピクセルの RGB 平均を取り、その色で塗りつぶす。同じ入力で同じ出力
 * (deterministic — seed なし) を保証する。
 *
 * 入力 img は同一オリジン (Object URL) 前提で getImageData が taint しない。
 */

export type MosaicCell = {
	x: number;
	y: number;
	width: number;
	height: number;
	cellSize: number;
};

/**
 * 指定した rect 群を mosaic 化し、画像サイズの canvas を返す。mosaic 領域外は
 * transparent。ImageStage 内で <img> の上に重ねて描画する想定。
 */
export function computeMosaicCanvas(
	img: CanvasImageSource & { width?: number; height?: number },
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
		paintMosaicRect(outCtx, img, rect, imageWidth, imageHeight);
	}
	return out;
}

function paintMosaicRect(
	outCtx: CanvasRenderingContext2D,
	img: CanvasImageSource,
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

	const tmp = document.createElement("canvas");
	tmp.width = w;
	tmp.height = h;
	const tmpCtx = tmp.getContext("2d");
	if (!tmpCtx) return;
	tmpCtx.drawImage(img, sx, sy, w, h, 0, 0, w, h);

	let data: ImageData;
	try {
		data = tmpCtx.getImageData(0, 0, w, h);
	} catch {
		// CORS taint などで読めなければ無処理
		return;
	}

	const cell = Math.max(1, Math.floor(rect.cellSize));
	const pixels = data.data;

	for (let cy = 0; cy < h; cy += cell) {
		const cellH = Math.min(cell, h - cy);
		for (let cx = 0; cx < w; cx += cell) {
			const cellW = Math.min(cell, w - cx);
			let r = 0;
			let g = 0;
			let b = 0;
			let count = 0;
			for (let py = 0; py < cellH; py++) {
				const rowIdx = ((cy + py) * w + cx) * 4;
				for (let px = 0; px < cellW; px++) {
					const i = rowIdx + px * 4;
					const a = pixels[i + 3];
					if (a === 0) continue;
					r += pixels[i];
					g += pixels[i + 1];
					b += pixels[i + 2];
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
