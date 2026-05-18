import { type RefObject, useEffect, useMemo, useRef } from "react";
import { computeMosaicCanvas, type MosaicCell } from "~/lib/mosaic";
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
 * 表現できない「ピクセル化」を担う。<img> の load が終わってからピクセル
 * データを取得する必要があるので、imgRef.complete を確認しつつ load イベントで
 * 再描画する。
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
			const result = computeMosaicCanvas(img, cells, imageWidth, imageHeight);
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
