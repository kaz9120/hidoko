import type { FocalPoint, PhotoFilter, PhotoLayout, TextGuard } from "./types";

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

// ─────────────────────────────────────────────────────────
// 写真の加工プリセット
//   係数はここに集約し、UI にスライダーは出さない（盛りすぎを構造的に防ぐ）。
//   CSS filter は html-to-image が計算済みスタイルごと複製するので、
//   プレビューと書き出し PNG が同じ見えになる。
// ─────────────────────────────────────────────────────────

/** 加工プリセットの一覧（UI の並び順） */
export const PHOTO_FILTERS = [
	{ id: "none", label: "そのまま" },
	{ id: "awaku", label: "淡く" },
	{ id: "kukkiri", label: "くっきり" },
	{ id: "mono", label: "モノクロ" },
	{ id: "vignette", label: "ビネット" },
] as const satisfies readonly { id: PhotoFilter; label: string }[];

// 「やりすぎない」値に調整した固定係数。
// - awaku:    明度を上げ彩度を抜いて台紙の配色に馴染ませる（余白感）
// - kukkiri:  コントラストと彩度をひと押しだけ。輪郭線は強調しない
// - mono:     完全グレースケール + わずかな締まり
// - vignette: 本体はごく弱い減彩のみ。四隅は VIGNETTE_OVERLAY が落とす
const FILTER_CSS: Record<PhotoFilter, string | undefined> = {
	none: undefined,
	awaku: "brightness(1.08) saturate(0.72) contrast(0.92)",
	kukkiri: "contrast(1.09) saturate(1.12)",
	mono: "grayscale(1) contrast(1.05) brightness(1.02)",
	vignette: "saturate(0.94) contrast(1.02)",
};

/** 加工プリセットを CSS filter 値に変換する（none は undefined） */
export function photoFilterCss(filter: PhotoFilter): string | undefined {
	return FILTER_CSS[filter];
}

/**
 * ビネットの四隅を落とすオーバーレイ。CSS filter 単体では作れないため、
 * 写真の直上に重ねる radial-gradient で作る（純黒でなく暖黒 #0c0804 ベース）。
 */
export const VIGNETTE_OVERLAY = `radial-gradient(ellipse farthest-corner at 50% 45%, rgba(12,8,4,0) 52%, rgba(12,8,4,0.28) 82%, rgba(12,8,4,0.48) 100%)`;

/**
 * テキスト保護方式の一覧（UI の並び順）。
 * Cover の全面配置（写真の上に文字が乗る構図）でのみ選択できる。
 */
export const TEXT_GUARDS = [
	{ id: "scrim", label: "スクリム" },
	{ id: "band", label: "帯" },
	{ id: "box", label: "ボックス" },
	{ id: "overlay", label: "全面" },
] as const satisfies readonly { id: TextGuard; label: string }[];
