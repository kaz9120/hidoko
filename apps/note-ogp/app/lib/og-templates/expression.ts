import type { JumpRate, Spacing } from "./types";

// ─────────────────────────────────────────────────────────
// 表情プリセット（余白量 × ジャンプ率）
//   参考書 3 冊が共通して挙げる「印象を決める 2 大パラメータ」。
//   さじ加減は 3 段階の固定プリセットで提供し、連続スライダーは出さない
//   （「やりすぎ」を構造的に防ぐ）。「標準」は係数 1.0 で、現行の見た目と
//   ピクセル単位で一致する。
//
//   係数化するのは次の 2 系統だけに絞る。
//   - 余白量:    外余白系のアンカー（左右マージン・マストヘッド上・
//                フッター下）。テンプレの絶対座標の骨格（タイトル帯の
//                top、角版写真の位置など）は動かさない
//   - ジャンプ率: AutoFitTitle の max（最大値側の基準）と、リード・
//                著者まわりのフォントサイズ。min / maxH / 縮小ロジックは
//                据え置き — 長いタイトルは今までどおり自動で収まる
// ─────────────────────────────────────────────────────────

export const SPACING_OPTIONS = [
	{ id: "tight", label: "タイト" },
	{ id: "normal", label: "標準" },
	{ id: "loose", label: "ゆったり" },
] as const satisfies readonly { id: Spacing; label: string }[];

export const JUMP_RATE_OPTIONS = [
	{ id: "low", label: "控えめ" },
	{ id: "normal", label: "標準" },
	{ id: "high", label: "強め" },
] as const satisfies readonly { id: JumpRate; label: string }[];

// 余白係数。タイトは詰めて勢いを、ゆったりは間を取って上品さを出す。
// 控えめな振れ幅にとどめ、どのテンプレでも要素が重ならない範囲に収める。
const SPACING_COEF: Record<Spacing, number> = {
	tight: 0.74,
	normal: 1,
	loose: 1.26,
};

/** 外余白系の寸法（px）を余白プリセットで係数化する */
export function spacingPx(base: number, spacing: Spacing): number {
	return Math.round(base * SPACING_COEF[spacing]);
}

// ジャンプ率はタイトルと従属要素を逆方向に動かしてサイズ比を変える。
// 控えめ＝タイトルを抑えてリードを少し立てる（しっとり・上品）、
// 強め＝タイトルを立ててリードを抑える（勢い・インパクト）。
const JUMP_SCALES: Record<JumpRate, { title: number; sub: number }> = {
	low: { title: 0.85, sub: 1.06 },
	normal: { title: 1, sub: 1 },
	high: { title: 1.12, sub: 0.92 },
};

/** タイトルの最大フォントサイズ（AutoFitTitle の max）を係数化する */
export function titlePx(base: number, jumpRate: JumpRate): number {
	return Math.round(base * JUMP_SCALES[jumpRate].title);
}

/** リード・著者などの従属要素のフォントサイズを係数化する */
export function subPx(base: number, jumpRate: JumpRate): number {
	return Math.round(base * JUMP_SCALES[jumpRate].sub);
}
