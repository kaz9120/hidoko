import type { CropEngineHandle } from "~/hooks/use-crop-engine";
import { paintMosaicRect } from "~/lib/mosaic";
import {
	FILL_OPACITY,
	MOSAIC_PX,
	OUTLINE_PX,
	type RectAnnotation,
} from "~/lib/rect-engine";

/**
 * 現在のクロップ範囲を Blob に変換する。
 * MIME タイプを指定しない場合は image/png にフォールバックする。
 *
 * annotations が指定されていれば、画像座標系で各 annotation を baked-in する。
 * クロップ領域に重なる annotation だけを対象に、出力サイズの canvas へ直接
 * 重ね描く (元画像全面を一度焼くアプローチだと、大きな画像で常に
 * 元解像度の中間 canvas を作ってしまい重かった)。
 */
export async function getCroppedBlob(
	engine: CropEngineHandle,
	type = "image/png",
	annotations: readonly RectAnnotation[] = [],
): Promise<Blob> {
	const canvas =
		annotations.length > 0
			? renderAnnotatedCroppedCanvas(engine, annotations)
			: engine.toCanvas({ imageSmoothingQuality: "high" });
	return await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error("Failed to encode canvas to blob"));
			}
		}, type);
	});
}

/**
 * クロップ済み出力 canvas に annotation を baked-in して返す。中間で
 * フル解像度 canvas を作らず、出力サイズに直接描く。
 *
 * mosaic は annotation を 1 つでも重ね描く前の cropped 画像ピクセルを
 * 1 度だけサンプル元に取り、createdAt 順に重ね描き中の上書きを受けない
 * ようにする。
 */
function renderAnnotatedCroppedCanvas(
	engine: CropEngineHandle,
	annotations: readonly RectAnnotation[],
): HTMLCanvasElement {
	const cropRect = engine.getData();
	const source = engine.getSourceImage();
	if (!source) {
		throw new Error("crop engine: image is not ready");
	}

	const out = document.createElement("canvas");
	out.width = Math.max(1, Math.round(cropRect.width));
	out.height = Math.max(1, Math.round(cropRect.height));
	const outCtx = out.getContext("2d", { willReadFrequently: true });
	if (!outCtx) {
		throw new Error("crop engine: 2D context unavailable");
	}
	outCtx.imageSmoothingEnabled = true;
	outCtx.imageSmoothingQuality = "high";
	outCtx.drawImage(
		source,
		cropRect.x,
		cropRect.y,
		cropRect.width,
		cropRect.height,
		0,
		0,
		out.width,
		out.height,
	);

	const visible = annotations.filter((a) => intersectsCrop(a, cropRect));
	if (visible.length > 0) {
		drawAnnotations(outCtx, out.width, out.height, visible, cropRect);
	}
	return out;
}

function intersectsCrop(
	a: RectAnnotation,
	crop: { x: number; y: number; width: number; height: number },
): boolean {
	return !(
		a.x + a.width <= crop.x ||
		a.y + a.height <= crop.y ||
		a.x >= crop.x + crop.width ||
		a.y >= crop.y + crop.height
	);
}

function drawAnnotations(
	ctx: CanvasRenderingContext2D,
	outWidth: number,
	outHeight: number,
	annotations: readonly RectAnnotation[],
	cropRect: { x: number; y: number },
): void {
	const sorted = [...annotations].sort((a, b) => a.createdAt - b.createdAt);
	const needsMosaic = sorted.some((a) => a.style === "mosaic");
	// mosaic 用に「annotation を 1 つも乗せていない cropped 画像のピクセル」を
	// 1 度だけ取る。createdAt 順に上書きされていく途中の状態をサンプルしない。
	let pixels: ImageData | null = null;
	if (needsMosaic) {
		try {
			pixels = ctx.getImageData(0, 0, outWidth, outHeight);
		} catch {
			pixels = null;
		}
	}

	const prevAlpha = ctx.globalAlpha;
	for (const ann of sorted) {
		const x = ann.x - cropRect.x;
		const y = ann.y - cropRect.y;
		if (ann.style === "outline") {
			ctx.strokeStyle = ann.color;
			ctx.lineWidth = OUTLINE_PX[ann.thickness];
			pathRoundRect(ctx, x, y, ann.width, ann.height, 1);
			ctx.stroke();
		} else if (ann.style === "fill") {
			ctx.fillStyle = ann.color;
			ctx.globalAlpha = FILL_OPACITY;
			pathRoundRect(ctx, x, y, ann.width, ann.height, 2);
			ctx.fill();
			ctx.globalAlpha = prevAlpha;
		} else if (ann.style === "mosaic" && pixels) {
			paintMosaicRect(
				ctx,
				pixels,
				{
					x,
					y,
					width: ann.width,
					height: ann.height,
					cellSize: MOSAIC_PX[ann.thickness],
				},
				outWidth,
				outHeight,
			);
		}
	}
}

function pathRoundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	ctx.beginPath();
	// modern browsers expose roundRect; fallback to plain rect for stale ones
	const c = ctx as CanvasRenderingContext2D & {
		roundRect?: (x: number, y: number, w: number, h: number, r: number) => void;
	};
	if (typeof c.roundRect === "function") {
		c.roundRect(x, y, w, h, r);
	} else {
		ctx.rect(x, y, w, h);
	}
}

/**
 * Blob をブラウザにダウンロードさせる。<a download> を生成して click した後、
 * URL を revoke する。
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

/**
 * snapcrop-YYYYMMDD-HHmmss.png 形式のファイル名を生成する。
 */
export function makeDownloadFilename(extension = "png"): string {
	const now = new Date();
	const pad = (n: number) => n.toString().padStart(2, "0");
	const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
	return `snapcrop-${stamp}.${extension}`;
}
