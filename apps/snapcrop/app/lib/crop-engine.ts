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

	// 画像境界に当たったらアンカー側を維持して打ち止めにする。clampRect は
	// アンカー情報を持たないので、ここで先に処理しないと「左辺をドラッグして
	// 左へはみ出した時に右辺まで動いてしまう」挙動になる。
	const ar =
		aspectRatio !== null && Number.isFinite(aspectRatio) && aspectRatio > 0
			? aspectRatio
			: null;

	const reconcileVerticalForHorizontalHandle = () => {
		if (ar === null) return;
		const newH = width / ar;
		if (hasN) {
			y = rect.y + rect.height - newH;
		} else if (hasS) {
			y = rect.y;
		} else {
			y = rect.y + rect.height / 2 - newH / 2;
		}
		height = newH;
	};

	const reconcileHorizontalForVerticalHandle = () => {
		if (ar === null) return;
		const newW = height * ar;
		if (hasW) {
			x = rect.x + rect.width - newW;
		} else if (hasE) {
			x = rect.x;
		} else {
			x = rect.x + rect.width / 2 - newW / 2;
		}
		width = newW;
	};

	if (hasW && x < 0) {
		// 右辺 (rect.x + rect.width) を固定して左辺を 0 に
		width = rect.x + rect.width;
		x = 0;
		reconcileVerticalForHorizontalHandle();
	}
	if (hasE && x + width > img.naturalWidth) {
		// 左辺 (rect.x) を固定して右辺を画像端に
		width = img.naturalWidth - rect.x;
		x = rect.x;
		reconcileVerticalForHorizontalHandle();
	}
	if (hasN && y < 0) {
		// 下辺 (rect.y + rect.height) を固定して上辺を 0 に
		height = rect.y + rect.height;
		y = 0;
		reconcileHorizontalForVerticalHandle();
	}
	if (hasS && y + height > img.naturalHeight) {
		// 上辺 (rect.y) を固定して下辺を画像端に
		height = img.naturalHeight - rect.y;
		y = rect.y;
		reconcileHorizontalForVerticalHandle();
	}

	// 最小サイズに到達したらアンカー側を維持する。aspectRatio が固定なら両辺を
	// 独立にクランプすると比率が崩れるので、両辺を同じ scale で同時に拡張する。
	if (ar !== null) {
		let scale = 1;
		if (width < minSize) {
			scale = Math.max(scale, minSize / Math.max(width, 1));
		}
		if (height < minSize) {
			scale = Math.max(scale, minSize / Math.max(height, 1));
		}
		if (scale > 1) {
			const newW = width * scale;
			const newH = height * scale;
			if (hasW) {
				x = rect.x + rect.width - newW;
			} else if (!hasE) {
				x = rect.x + rect.width / 2 - newW / 2;
			}
			if (hasN) {
				y = rect.y + rect.height - newH;
			} else if (!hasS) {
				y = rect.y + rect.height / 2 - newH / 2;
			}
			width = newW;
			height = newH;
		}
	} else {
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
	}

	// セーフティネット (上記で取りこぼした境界はみ出しや minSize 制約)
	return clampRect({ x, y, width, height }, img, minSize);
}
