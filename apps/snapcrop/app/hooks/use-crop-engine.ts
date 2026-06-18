import {
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	type CropRect,
	clampRect,
	type ImageMetrics,
	MIN_CROP_SIZE,
	moveRect,
	type ResizeHandle,
	resizeRect,
	selectAllRect,
} from "~/lib/crop-engine";

export type CropData = CropRect;
export type { CropRect, ImageMetrics, ResizeHandle };

/**
 * 画像内に収まり指定比率を満たす最大の矩形を中央配置する。比率制約なしのときは
 * 画像全体を返す。初期化と ⌘A の両方から呼ぶ。
 */
function buildInitialRect(img: ImageMetrics, ar: number | null): CropRect {
	if (ar === null) {
		return selectAllRect(img);
	}
	const imgAr = img.naturalWidth / img.naturalHeight;
	let width: number;
	let height: number;
	if (ar > imgAr) {
		width = img.naturalWidth;
		height = width / ar;
	} else {
		height = img.naturalHeight;
		width = height * ar;
	}
	return {
		x: (img.naturalWidth - width) / 2,
		y: (img.naturalHeight - height) / 2,
		width,
		height,
	};
}

/**
 * Cropper.js が公開していた imperative API の互換 subset。site-header / hooks /
 * image-export はこのハンドル経由でクロップ状態を読み書きする。
 */
export type CropEngineHandle = {
	setAspectRatio: (ratio: number) => void;
	setData: (partial: Partial<CropRect>) => void;
	getData: () => CropData;
	getImageData: () => ImageMetrics;
	selectAll: () => void;
	toCanvas: (opts?: {
		imageSmoothingQuality?: "low" | "medium" | "high";
	}) => HTMLCanvasElement;
	/** annotation を export 時に flatten するため、ソース <img> を直接取りに行く */
	getSourceImage: () => HTMLImageElement | null;
};

export type UseCropEngineArgs = {
	image: ImageMetrics | null;
	imgElementRef: RefObject<HTMLImageElement | null>;
	onChange?: (rect: CropRect) => void;
};

export type UseCropEngineResult = {
	handle: CropEngineHandle;
	cropRect: CropRect | null;
	aspectRatio: number | null;
	beginMove: () => void;
	beginResize: (h: ResizeHandle) => void;
	updateInteraction: (delta: { dx: number; dy: number }) => void;
	endInteraction: () => void;
};

/**
 * クロップ状態を管理し、Cropper.js 互換の imperative ハンドルを公開するフック。
 * image が差し替わったら自動で全選択にリセットする。
 */
export function useCropEngine(args: UseCropEngineArgs): UseCropEngineResult {
	const { image, imgElementRef, onChange } = args;
	const [cropRect, setCropRect] = useState<CropRect | null>(null);
	const [aspectRatio, setAspectRatio] = useState<number | null>(null);

	const cropRectRef = useRef<CropRect | null>(null);
	cropRectRef.current = cropRect;
	const aspectRatioRef = useRef<number | null>(null);
	aspectRatioRef.current = aspectRatio;
	const imageRef = useRef<ImageMetrics | null>(null);
	imageRef.current = image;
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	const commit = useCallback((next: CropRect) => {
		setCropRect(next);
		cropRectRef.current = next;
		onChangeRef.current?.(next);
	}, []);

	// image が決まったら、現在の aspectRatio ロックを尊重して初期化する。
	// 比率がロック中なら「画像内に収まる最大の比率矩形」、なければ全選択。
	useEffect(() => {
		if (image) {
			commit(
				clampRect(
					buildInitialRect(image, aspectRatioRef.current),
					image,
					MIN_CROP_SIZE,
				),
			);
		} else {
			setCropRect(null);
			cropRectRef.current = null;
		}
	}, [image, commit]);

	const interactionRef = useRef<{
		startRect: CropRect;
		kind: "move" | { resize: ResizeHandle };
	} | null>(null);

	const beginMove = useCallback(() => {
		if (!cropRectRef.current) return;
		interactionRef.current = {
			startRect: cropRectRef.current,
			kind: "move",
		};
	}, []);

	const beginResize = useCallback((h: ResizeHandle) => {
		if (!cropRectRef.current) return;
		interactionRef.current = {
			startRect: cropRectRef.current,
			kind: { resize: h },
		};
	}, []);

	const updateInteraction = useCallback(
		(delta: { dx: number; dy: number }) => {
			const it = interactionRef.current;
			const img = imageRef.current;
			if (!it || !img) return;
			const next =
				it.kind === "move"
					? moveRect(it.startRect, delta, img)
					: resizeRect(it.startRect, it.kind.resize, delta, {
							aspectRatio: aspectRatioRef.current,
							img,
							minSize: MIN_CROP_SIZE,
						});
			commit(next);
		},
		[commit],
	);

	const endInteraction = useCallback(() => {
		interactionRef.current = null;
	}, []);

	const handle = useMemo<CropEngineHandle>(
		() => ({
			setAspectRatio: (ratio: number) => {
				const next = Number.isFinite(ratio) && ratio > 0 ? ratio : null;
				setAspectRatio(next);
				aspectRatioRef.current = next;
				const cur = cropRectRef.current;
				const img = imageRef.current;
				if (!cur || !img || next === null) return;
				// クロップの中心を維持しつつ、画像内に収まり width/height が ratio を満たす
				// 最大矩形を作る。高さ基準で幅を出してはみ出したら幅基準に切り替え、両者を
				// 同じ scale で縮めることで「設定後に比率が合っていない」状態を避ける。
				const cx = cur.x + cur.width / 2;
				const cy = cur.y + cur.height / 2;
				let width = cur.height * next;
				let height = cur.height;
				if (width > img.naturalWidth) {
					width = img.naturalWidth;
					height = width / next;
				}
				if (height > img.naturalHeight) {
					height = img.naturalHeight;
					width = height * next;
				}
				commit(
					clampRect(
						{
							x: cx - width / 2,
							y: cy - height / 2,
							width,
							height,
						},
						img,
						MIN_CROP_SIZE,
					),
				);
			},
			setData: (partial: Partial<CropRect>) => {
				const cur = cropRectRef.current;
				const img = imageRef.current;
				if (!cur || !img) return;
				commit(
					clampRect(
						{
							x: partial.x ?? cur.x,
							y: partial.y ?? cur.y,
							width: partial.width ?? cur.width,
							height: partial.height ?? cur.height,
						},
						img,
						MIN_CROP_SIZE,
					),
				);
			},
			getData: () => cropRectRef.current ?? { x: 0, y: 0, width: 0, height: 0 },
			getImageData: () =>
				imageRef.current ?? { naturalWidth: 0, naturalHeight: 0 },
			selectAll: () => {
				const img = imageRef.current;
				if (!img) return;
				commit(
					clampRect(
						buildInitialRect(img, aspectRatioRef.current),
						img,
						MIN_CROP_SIZE,
					),
				);
			},
			toCanvas: (opts) => {
				const rect = cropRectRef.current;
				const source = imgElementRef.current;
				if (!rect || !source) {
					throw new Error("crop engine: image is not ready");
				}
				const canvas = document.createElement("canvas");
				canvas.width = Math.round(rect.width);
				canvas.height = Math.round(rect.height);
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					throw new Error("crop engine: 2D context unavailable");
				}
				if (opts?.imageSmoothingQuality) {
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = opts.imageSmoothingQuality;
				}
				ctx.drawImage(
					source,
					rect.x,
					rect.y,
					rect.width,
					rect.height,
					0,
					0,
					canvas.width,
					canvas.height,
				);
				return canvas;
			},
			getSourceImage: () => imgElementRef.current,
		}),
		[commit, imgElementRef],
	);

	return {
		handle,
		cropRect,
		aspectRatio,
		beginMove,
		beginResize,
		updateInteraction,
		endInteraction,
	};
}
