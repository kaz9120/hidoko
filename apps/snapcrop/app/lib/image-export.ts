import type { CropEngineHandle } from "~/hooks/use-crop-engine";
import { paintMosaicRect, readImagePixels } from "~/lib/mosaic";
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
 * 元画像 → annotation 描き込み → クロップ範囲だけ切り出し、の順で 1 枚に焼く。
 * mosaic は元画像のピクセル平均で焼くので、見た目通り (= キャンバス上で見えて
 * いる粒度) になる。
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
 * 元画像サイズの canvas に画像 + annotation を焼き、クロップ範囲を出力 canvas に
 * 写す。元画像座標を 1 つの基準にすることで、annotation の位置 / 太さ / mosaic
 * セルが見た目と一致する。
 */
function renderAnnotatedCroppedCanvas(
	engine: CropEngineHandle,
	annotations: readonly RectAnnotation[],
): HTMLCanvasElement {
	const cropRect = engine.getData();
	const source = engine.getSourceImage();
	const metrics = engine.getImageData();
	if (!source) {
		throw new Error("crop engine: image is not ready");
	}

	const full = document.createElement("canvas");
	full.width = Math.max(1, Math.round(metrics.naturalWidth));
	full.height = Math.max(1, Math.round(metrics.naturalHeight));
	const fullCtx = full.getContext("2d", { willReadFrequently: true });
	if (!fullCtx) {
		throw new Error("crop engine: 2D context unavailable");
	}
	fullCtx.drawImage(source, 0, 0, full.width, full.height);
	drawAnnotations(fullCtx, source, full.width, full.height, annotations);

	const out = document.createElement("canvas");
	out.width = Math.max(1, Math.round(cropRect.width));
	out.height = Math.max(1, Math.round(cropRect.height));
	const outCtx = out.getContext("2d");
	if (!outCtx) {
		throw new Error("crop engine: 2D context unavailable");
	}
	outCtx.imageSmoothingEnabled = true;
	outCtx.imageSmoothingQuality = "high";
	outCtx.drawImage(
		full,
		cropRect.x,
		cropRect.y,
		cropRect.width,
		cropRect.height,
		0,
		0,
		out.width,
		out.height,
	);
	return out;
}

function drawAnnotations(
	ctx: CanvasRenderingContext2D,
	source: HTMLImageElement,
	imageWidth: number,
	imageHeight: number,
	annotations: readonly RectAnnotation[],
): void {
	const sorted = [...annotations].sort((a, b) => a.createdAt - b.createdAt);
	const needsMosaic = sorted.some((a) => a.style === "mosaic");
	// mosaic は「元画像のピクセル」を平均する。canvas に annotation を重ね描き
	// する前のピクセルを使いたいので、source <img> を直接サンプル元にする。
	const pixels = needsMosaic
		? readImagePixels(source, imageWidth, imageHeight)
		: null;

	const prevAlpha = ctx.globalAlpha;
	for (const ann of sorted) {
		if (ann.style === "outline") {
			ctx.strokeStyle = ann.color;
			ctx.lineWidth = OUTLINE_PX[ann.thickness];
			pathRoundRect(ctx, ann.x, ann.y, ann.width, ann.height, 1);
			ctx.stroke();
		} else if (ann.style === "fill") {
			ctx.fillStyle = ann.color;
			ctx.globalAlpha = FILL_OPACITY;
			pathRoundRect(ctx, ann.x, ann.y, ann.width, ann.height, 2);
			ctx.fill();
			ctx.globalAlpha = prevAlpha;
		} else if (ann.style === "mosaic" && pixels) {
			paintMosaicRect(
				ctx,
				pixels,
				{
					x: ann.x,
					y: ann.y,
					width: ann.width,
					height: ann.height,
					cellSize: MOSAIC_PX[ann.thickness],
				},
				imageWidth,
				imageHeight,
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
