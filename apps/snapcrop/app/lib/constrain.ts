/**
 * Shift ドラッグの拘束描画を画像座標系 (px) で扱う純粋関数群。React 非依存で、
 * 「描画中の current 点をどこへ吸着させるか」だけを担う。拘束を適用するか
 * どうか (Shift の押下状態) は各 engine hook が interaction state で管理する。
 */

import type { ImageMetrics } from "~/lib/crop-engine";

export type Point = { x: number; y: number };

/**
 * 矩形・モザイク描画用: start を固定点として current を「正方形になる点」へ
 * 吸着する。辺長はドラッグの長い方の軸に合わせ (一般的なエディタの挙動)、
 * 画像境界を越える場合は正方形を保ったまま辺長を切り詰める。
 */
export function constrainToSquare(
	start: Point,
	current: Point,
	img: ImageMetrics,
): Point {
	const dx = current.x - start.x;
	const dy = current.y - start.y;
	const sx = dx < 0 ? -1 : 1;
	const sy = dy < 0 ? -1 : 1;
	const availX = sx > 0 ? img.naturalWidth - start.x : start.x;
	const availY = sy > 0 ? img.naturalHeight - start.y : start.y;
	const side = Math.max(
		0,
		Math.min(Math.max(Math.abs(dx), Math.abs(dy)), availX, availY),
	);
	return { x: start.x + sx * side, y: start.y + sy * side };
}

// 45° 刻みの単位ベクトル 8 方向。cos/sin の浮動小数誤差で水平・垂直が
// 僅かに傾くのを避けるため、定数テーブルで持つ。
const DIAG = Math.SQRT1_2;
const SNAP_DIRECTIONS: readonly Point[] = [
	{ x: 1, y: 0 },
	{ x: DIAG, y: DIAG },
	{ x: 0, y: 1 },
	{ x: -DIAG, y: DIAG },
	{ x: -1, y: 0 },
	{ x: -DIAG, y: -DIAG },
	{ x: 0, y: -1 },
	{ x: DIAG, y: -DIAG },
];

/**
 * 矢印描画用: current を「start からの角度が 45° の倍数になる点」へ吸着する。
 * 長さはドラッグベクトルをスナップ方向へ射影して保ち、画像境界を越える場合は
 * 角度を保ったまま方向に沿って切り詰める。
 */
export function constrainToAngleSnap(
	start: Point,
	current: Point,
	img: ImageMetrics,
): Point {
	const dx = current.x - start.x;
	const dy = current.y - start.y;
	if (dx === 0 && dy === 0) return current;
	const index = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8;
	const dir = SNAP_DIRECTIONS[index];
	let t = dx * dir.x + dy * dir.y;
	if (dir.x > 0) t = Math.min(t, (img.naturalWidth - start.x) / dir.x);
	if (dir.x < 0) t = Math.min(t, -start.x / dir.x);
	if (dir.y > 0) t = Math.min(t, (img.naturalHeight - start.y) / dir.y);
	if (dir.y < 0) t = Math.min(t, -start.y / dir.y);
	t = Math.max(0, t);
	return { x: start.x + dir.x * t, y: start.y + dir.y * t };
}

/**
 * マーカー描画用: ドラッグ方向の優勢な軸へ吸着し、水平または垂直の線分にする。
 */
export function constrainToAxis(start: Point, current: Point): Point {
	const dx = current.x - start.x;
	const dy = current.y - start.y;
	return Math.abs(dx) >= Math.abs(dy)
		? { x: current.x, y: start.y }
		: { x: start.x, y: current.y };
}
