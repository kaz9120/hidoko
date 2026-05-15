/**
 * クロップ範囲を画像座標系 (px) で扱う純粋関数群。Cropper.js 撤去に伴って
 * 自前で持つ。React 非依存で、引数で受け取った rect を更新した新しい rect を返す。
 */

export type CropRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type ImageMetrics = {
	naturalWidth: number;
	naturalHeight: number;
};

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/** rect を画像範囲内に収め、最小サイズ制約を満たすよう調整する。 */
export function clampRect(
	rect: CropRect,
	img: ImageMetrics,
	minSize: number,
): CropRect {
	// 画像自体が minSize より小さい場合は画像サイズが上限
	const maxW = img.naturalWidth;
	const maxH = img.naturalHeight;
	const minW = Math.min(minSize, maxW);
	const minH = Math.min(minSize, maxH);
	const width = Math.max(minW, Math.min(rect.width, maxW));
	const height = Math.max(minH, Math.min(rect.height, maxH));
	const x = Math.max(0, Math.min(rect.x, maxW - width));
	const y = Math.max(0, Math.min(rect.y, maxH - height));
	return { x, y, width, height };
}

export function moveRect(
	rect: CropRect,
	delta: { dx: number; dy: number },
	img: ImageMetrics,
): CropRect {
	return clampRect(
		{ ...rect, x: rect.x + delta.dx, y: rect.y + delta.dy },
		img,
		Math.min(rect.width, rect.height),
	);
}

export function selectAllRect(img: ImageMetrics): CropRect {
	return {
		x: 0,
		y: 0,
		width: img.naturalWidth,
		height: img.naturalHeight,
	};
}

/**
 * ハンドルをドラッグした距離 (画像座標) から、新しい rect を算出する。
 * 1) 各辺を delta で伸縮、2) aspectRatio があれば対辺を主軸に追従、
 * 3) 最小サイズに達したらアンカー側を維持する形で固定、4) clampRect で画像内に収める。
 */
export function resizeRect(
	rect: CropRect,
	handle: ResizeHandle,
	delta: { dx: number; dy: number },
	opts: {
		aspectRatio: number | null;
		img: ImageMetrics;
		minSize: number;
	},
): CropRect {
	const { aspectRatio, img, minSize } = opts;
	const hasN = handle.includes("n");
	const hasS = handle.includes("s");
	const hasE = handle.includes("e");
	const hasW = handle.includes("w");

	let x = rect.x;
	let y = rect.y;
	let width = rect.width;
	let height = rect.height;

	if (hasE) {
		width = rect.width + delta.dx;
	}
	if (hasW) {
		width = rect.width - delta.dx;
		x = rect.x + delta.dx;
	}
	if (hasS) {
		height = rect.height + delta.dy;
	}
	if (hasN) {
		height = rect.height - delta.dy;
		y = rect.y + delta.dy;
	}

	if (aspectRatio !== null && Number.isFinite(aspectRatio) && aspectRatio > 0) {
		const isCorner = (hasN || hasS) && (hasE || hasW);
		let nextW: number;
		let nextH: number;
		if (isCorner) {
			// 長辺で決める (どちらかが負になっても max を取ることで安定)
			if (Math.abs(height) * aspectRatio > Math.abs(width)) {
				nextH = height;
				nextW = height * aspectRatio;
			} else {
				nextW = width;
				nextH = width / aspectRatio;
			}
		} else if (hasE || hasW) {
			nextW = width;
			nextH = width / aspectRatio;
		} else {
			nextH = height;
			nextW = height * aspectRatio;
		}

		if (hasW) {
			x = rect.x + rect.width - nextW;
		} else if (!hasE) {
			// 縦辺ハンドル時の横方向はクロップ中心を維持
			x = rect.x + rect.width / 2 - nextW / 2;
		}
		if (hasN) {
			y = rect.y + rect.height - nextH;
		} else if (!hasS) {
			y = rect.y + rect.height / 2 - nextH / 2;
		}
		width = nextW;
		height = nextH;
	}

	// 最小サイズに到達したらアンカー側を維持する
	if (width < minSize) {
		if (hasW) {
			x = rect.x + rect.width - minSize;
		}
		width = minSize;
	}
	if (height < minSize) {
		if (hasN) {
			y = rect.y + rect.height - minSize;
		}
		height = minSize;
	}

	return clampRect({ x, y, width, height }, img, minSize);
}
