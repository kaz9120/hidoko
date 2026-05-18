import { type RefObject, useEffect, useMemo, useRef } from "react";
import {
	computeMosaicCanvas,
	type MosaicCell,
	readImagePixels,
} from "~/lib/mosaic";
import { MOSAIC_PX, type RectAnnotation } from "~/lib/rect-engine";

type Props = {
	annotations: readonly RectAnnotation[];
	imgRef: RefObject<HTMLImageElement | null>;
	imageSrc: string;
	imageWidth: number;
	imageHeight: number;
};

/**
 * mosaic スタイルの矩形を 1 枚の canvas に焼いて重ねるレイヤー。SVG では
 * 表現できない「ピクセル化」を担う。
 *
 * パフォーマンス対策: 元画像の ImageData は ref に 1 度だけキャッシュし、矩形
 * 群の毎フレーム計算 (ドラッグ中の rect 群更新) で getImageData を呼び直さない。
 * 画像差し替え時は ImageCanvas が key=src で remount するので ref は自動で
 * クリアされる。
 *
 * z-order としては SVG annotation-layer の下に置き、outline / fill が mosaic
 * 上に重なる形にする。fill→mosaic の作成順で mosaic が上に来るべきという
 * 厳密な z-order は v1 では満たさない (シンプル優先)。
 */
export function MosaicLayer({
	annotations,
	imgRef,
	imageSrc,
	imageWidth,
	imageHeight,
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const pixelsRef = useRef<ImageData | null>(null);

	const cells = useMemo<MosaicCell[]>(
		() =>
			annotations
				.filter((a) => a.style === "mosaic")
				.map((a) => ({
					x: a.x,
					y: a.y,
					width: a.width,
					height: a.height,
					cellSize: MOSAIC_PX[a.thickness],
				})),
		[annotations],
	);

	// 画像差し替え時にピクセルキャッシュを明示的に捨てる。
	// 現状 ImageCanvas が key=image.src で remount するためキャッシュは
	// 自動でクリアされるが、その前提に依存しないよう effect 側でも保険を掛ける。
	// biome-ignore lint/correctness/useExhaustiveDependencies: imageSrc を retrigger key にしている
	useEffect(() => {
		pixelsRef.current = null;
	}, [imageSrc]);

	// imageSrc は effect 本体内で参照しないが、画像差し替え時に再描画させる
	// ための dep として明示しておく。
	// biome-ignore lint/correctness/useExhaustiveDependencies: imageSrc is a deliberate retrigger
	useEffect(() => {
		const img = imgRef.current;
		const canvas = canvasRef.current;
		if (!img || !canvas) return;

		let cancelled = false;
		const draw = () => {
			if (cancelled) return;
			const c = canvasRef.current;
			if (!c) return;
			c.width = Math.max(1, Math.round(imageWidth));
			c.height = Math.max(1, Math.round(imageHeight));
			const ctx = c.getContext("2d");
			if (!ctx) return;
			ctx.clearRect(0, 0, c.width, c.height);
			if (cells.length === 0) return;
			if (!pixelsRef.current) {
				pixelsRef.current = readImagePixels(img, imageWidth, imageHeight);
			}
			const pixels = pixelsRef.current;
			if (!pixels) return;
			const result = computeMosaicCanvas(
				pixels,
				cells,
				imageWidth,
				imageHeight,
			);
			ctx.drawImage(result, 0, 0);
		};

		if (img.complete && img.naturalWidth > 0) {
			draw();
			return () => {
				cancelled = true;
			};
		}

		const onLoad = () => draw();
		img.addEventListener("load", onLoad, { once: true });
		return () => {
			cancelled = true;
			img.removeEventListener("load", onLoad);
		};
	}, [cells, imageSrc, imageWidth, imageHeight, imgRef]);

	return (
		<canvas
			className="pointer-events-none absolute inset-0 size-full"
			ref={canvasRef}
		/>
	);
}
