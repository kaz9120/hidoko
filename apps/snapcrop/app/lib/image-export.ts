import type { CropEngineHandle } from "~/hooks/use-crop-engine";
import {
	groupAnnotationRuns,
	sortAnnotationsByZ,
} from "~/lib/annotation-z-order";
import { type ArrowAnnotation, getArrowRenderModel } from "~/lib/arrow-engine";
import {
	getHighlightRenderModel,
	type HighlightAnnotation,
} from "~/lib/highlight-engine";
import { paintMosaicRect } from "~/lib/mosaic";
import {
	FILL_OPACITY,
	MOSAIC_PX,
	OUTLINE_PX,
	type RectAnnotation,
} from "~/lib/rect-engine";
import {
	getTextRenderModel,
	type TextAnnotation,
	textBackgroundColor,
} from "~/lib/text-engine";

/**
 * 現在のクロップ範囲を Blob に変換する。
 * MIME タイプを指定しない場合は image/png にフォールバックする。
 *
 * annotations が指定されていれば、画像座標系で各 annotation を baked-in する。
 * クロップ領域に重なる annotation だけを対象に、出力サイズの canvas へ直接
 * 重ね描く (元画像全面を一度焼くアプローチだと、大きな画像で常に
 * 元解像度の中間 canvas を作ってしまい重かった)。
 *
 * arrows (矢印) / texts (テキスト) / highlights (マーカー) も同様に
 * baked-in する。重なり順は表示レイヤーと同じ zIndex 順
 * (annotation-z-order.ts) — 全種別を 1 本に合流し、同種別の連続区間 (run)
 * ごとに下から順に描く。マーカーは multiply 合成で描く (下の文字が透ける)。
 */
export async function getCroppedBlob(
	engine: CropEngineHandle,
	type = "image/png",
	annotations: readonly RectAnnotation[] = [],
	arrows: readonly ArrowAnnotation[] = [],
	texts: readonly TextAnnotation[] = [],
	highlights: readonly HighlightAnnotation[] = [],
): Promise<Blob> {
	const canvas =
		annotations.length > 0 ||
		arrows.length > 0 ||
		texts.length > 0 ||
		highlights.length > 0
			? renderAnnotatedCroppedCanvas(
					engine,
					annotations,
					arrows,
					texts,
					highlights,
				)
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
 * 1 度だけサンプル元に取り、zIndex 順に重ね描き中の上書きを受けない
 * ようにする。
 */
function renderAnnotatedCroppedCanvas(
	engine: CropEngineHandle,
	annotations: readonly RectAnnotation[],
	arrows: readonly ArrowAnnotation[],
	texts: readonly TextAnnotation[],
	highlights: readonly HighlightAnnotation[],
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

	// 表示 (image-stage) と同じ zIndex 順に合流し、同種別の連続区間 (run)
	// ごとに下から描く。z 操作をしていないドキュメントでは従来どおり
	// 矩形 → 矢印 → テキスト → マーカーの 4 区間になる。
	const runs = groupAnnotationRuns(
		sortAnnotationsByZ({ annotations, arrows, texts, highlights }),
	);

	// mosaic 用に「annotation を 1 つも乗せていない cropped 画像のピクセル」を
	// 1 度だけ取る。zIndex 順に上書きされていく途中の状態をサンプルしない。
	const needsMosaic = annotations.some(
		(a) => a.style === "mosaic" && intersectsCrop(a, cropRect),
	);
	let pixels: ImageData | null = null;
	if (needsMosaic) {
		try {
			pixels = outCtx.getImageData(0, 0, out.width, out.height);
		} catch {
			pixels = null;
		}
	}

	for (const run of runs) {
		switch (run.kind) {
			case "rect": {
				const visible = run.items.filter((a) => intersectsCrop(a, cropRect));
				if (visible.length > 0) {
					drawAnnotations(outCtx, visible, cropRect, pixels);
				}
				break;
			}
			case "arrow":
				drawArrows(outCtx, run.items, cropRect);
				break;
			case "text":
				drawTexts(outCtx, run.items, cropRect);
				break;
			case "highlight":
				drawHighlights(outCtx, run.items, cropRect);
				break;
		}
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

/**
 * 矩形を canvas に baked-in する。配列は zIndex 昇順 (context が維持する
 * 並び) を前提に、そのままの順で描く。pixels は mosaic のサンプル元
 * (注釈を 1 つも乗せていない cropped 画像)。呼び側が 1 度だけ取得して
 * 全 run で共有する。
 */
function drawAnnotations(
	ctx: CanvasRenderingContext2D,
	annotations: readonly RectAnnotation[],
	cropRect: { x: number; y: number },
	pixels: ImageData | null,
): void {
	const prevAlpha = ctx.globalAlpha;
	for (const ann of annotations) {
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
				pixels.width,
				pixels.height,
			);
		}
	}
}

/**
 * 矢印を canvas に baked-in する。形状計算は arrow-engine の
 * getArrowRenderModel に集約していて、SVG レイヤー (arrow-layer) と同じ
 * 見た目になる。手書き風 (sketchy) はモデルが返す SVG パス文字列を
 * Path2D に通して描くので、SVG 側とジオメトリが完全に一致する。
 * クロップ範囲外は canvas 側で自動的に切れるので、intersect 判定はしない
 * (矢印のパス描画は十分軽い)。
 */
function drawArrows(
	ctx: CanvasRenderingContext2D,
	arrows: readonly ArrowAnnotation[],
	cropRect: { x: number; y: number },
): void {
	const prevLineCap = ctx.lineCap;
	for (const arrow of arrows) {
		const m = getArrowRenderModel(arrow);
		ctx.strokeStyle = arrow.color;
		ctx.fillStyle = arrow.color;
		ctx.lineWidth = m.strokeWidth;
		ctx.lineCap = "round";
		if (m.sketchy) {
			// パス文字列は画像座標系なので、クロップ原点ぶん translate して描く
			ctx.save();
			ctx.translate(-cropRect.x, -cropRect.y);
			for (const d of m.sketchy.linePaths) {
				ctx.stroke(new Path2D(d));
			}
			for (const d of m.sketchy.capPaths) {
				ctx.fill(new Path2D(d));
			}
			ctx.restore();
			continue;
		}
		ctx.beginPath();
		ctx.moveTo(m.from.x - cropRect.x, m.from.y - cropRect.y);
		if (m.control) {
			ctx.quadraticCurveTo(
				m.control.x - cropRect.x,
				m.control.y - cropRect.y,
				m.to.x - cropRect.x,
				m.to.y - cropRect.y,
			);
		} else {
			ctx.lineTo(m.to.x - cropRect.x, m.to.y - cropRect.y);
		}
		ctx.stroke();
		for (const cap of m.caps) {
			if (cap.type === "arrowhead") {
				ctx.beginPath();
				ctx.moveTo(cap.points[0].x - cropRect.x, cap.points[0].y - cropRect.y);
				ctx.lineTo(cap.points[1].x - cropRect.x, cap.points[1].y - cropRect.y);
				ctx.lineTo(cap.points[2].x - cropRect.x, cap.points[2].y - cropRect.y);
				ctx.closePath();
				ctx.fill();
			} else {
				ctx.beginPath();
				ctx.arc(
					cap.center.x - cropRect.x,
					cap.center.y - cropRect.y,
					cap.radius,
					0,
					Math.PI * 2,
				);
				ctx.fill();
			}
		}
	}
	ctx.lineCap = prevLineCap;
}

/**
 * テキストを canvas に baked-in する。baseline・行送り・アンカーの計算は
 * text-engine の getTextRenderModel に集約していて、SVG レイヤー
 * (text-layer) と同じ見た目になる。クロップ範囲外は canvas 側で自動的に
 * 切れるので、intersect 判定はしない (テキスト描画は十分軽い)。
 */
function drawTexts(
	ctx: CanvasRenderingContext2D,
	texts: readonly TextAnnotation[],
	cropRect: { x: number; y: number },
): void {
	const prevAlign = ctx.textAlign;
	const prevBaseline = ctx.textBaseline;
	for (const t of texts) {
		const m = getTextRenderModel(t);
		const bg = textBackgroundColor(t.background);
		if (m.bgRect && bg) {
			ctx.fillStyle = bg;
			pathRoundRect(
				ctx,
				m.bgRect.x - cropRect.x,
				m.bgRect.y - cropRect.y,
				m.bgRect.width,
				m.bgRect.height,
				m.bgRect.radius,
			);
			ctx.fill();
		}
		ctx.font = m.font;
		ctx.textAlign = t.align;
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = t.color;
		for (const line of m.lines) {
			ctx.fillText(line.text, line.x - cropRect.x, line.baselineY - cropRect.y);
		}
	}
	ctx.textAlign = prevAlign;
	ctx.textBaseline = prevBaseline;
}

/**
 * マーカーを canvas に baked-in する。形状計算は highlight-engine の
 * getHighlightRenderModel に集約していて、SVG レイヤー (highlight-layer) と
 * 同じ見た目になる。蛍光ペンの重ね味は globalCompositeOperation = "multiply"
 * + globalAlpha で出す (SVG 側の mix-blend-mode: multiply + stroke-opacity
 * と同じ合成結果)。クロップ範囲外は canvas 側で自動的に切れるので、
 * intersect 判定はしない (drawArrows と同じ理由)。
 */
function drawHighlights(
	ctx: CanvasRenderingContext2D,
	highlights: readonly HighlightAnnotation[],
	cropRect: { x: number; y: number },
): void {
	const prevLineCap = ctx.lineCap;
	const prevAlpha = ctx.globalAlpha;
	const prevComposite = ctx.globalCompositeOperation;
	ctx.lineCap = "butt";
	ctx.globalCompositeOperation = "multiply";
	for (const h of highlights) {
		const m = getHighlightRenderModel(h);
		ctx.strokeStyle = m.color;
		ctx.lineWidth = m.bandWidth;
		ctx.globalAlpha = m.opacity;
		ctx.beginPath();
		ctx.moveTo(m.from.x - cropRect.x, m.from.y - cropRect.y);
		ctx.lineTo(m.to.x - cropRect.x, m.to.y - cropRect.y);
		ctx.stroke();
	}
	ctx.lineCap = prevLineCap;
	ctx.globalAlpha = prevAlpha;
	ctx.globalCompositeOperation = prevComposite;
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
