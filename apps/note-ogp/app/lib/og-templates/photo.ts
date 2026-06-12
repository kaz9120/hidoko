import type { FocalPoint, PhotoLayout } from "./types";

// ─────────────────────────────────────────────────────────
// 写真の配置とトリミング
//   配置型（photoLayout）と注視点（focalPoint）の定義をここに集約する。
//   クロップは CSS の object-fit: cover + object-position で実現する
//   — html-to-image は計算済みスタイルごと DOM を複製するので、
//   プレビューと書き出し PNG が同じクロップになる。
// ─────────────────────────────────────────────────────────

/** 配置型の一覧（UI の並び順） */
export const PHOTO_LAYOUTS = [
	{ id: "full", label: "全面" },
	{ id: "edge", label: "片寄せ" },
	{ id: "kakuhan", label: "角版" },
] as const satisfies readonly { id: PhotoLayout; label: string }[];

/** 9 点グリッドの並び（左上から右下 = UI のグリッド順） */
export const FOCAL_POINTS = [
	"top-left",
	"top",
	"top-right",
	"left",
	"center",
	"right",
	"bottom-left",
	"bottom",
	"bottom-right",
] as const satisfies readonly FocalPoint[];

const FOCAL_POSITIONS: Record<FocalPoint, string> = {
	"top-left": "0% 0%",
	top: "50% 0%",
	"top-right": "100% 0%",
	left: "0% 50%",
	center: "50% 50%",
	right: "100% 50%",
	"bottom-left": "0% 100%",
	bottom: "50% 100%",
	"bottom-right": "100% 100%",
};

/** 注視点を object-position の値に変換する */
export function focalObjectPosition(fp: FocalPoint): string {
	return FOCAL_POSITIONS[fp];
}
