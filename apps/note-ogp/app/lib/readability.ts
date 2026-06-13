import type { Fields } from "./og-templates";
import { paletteForSelection } from "./og-templates";
import { contrastRatio } from "./photo-palette";

// ─────────────────────────────────────────────────────────
// 可読性ガード（Issue #95）
//
// OGP は note のタイムラインで大きく縮小されて表示される。書籍の整理では
// 「遠くから見て全体を確認する」「Web の最小文字サイズは 10px」「文字と
// 背景の明度差を確保する」が可読性の基本。台紙の自由度が増えた今、
// 作り込んだ結果がタイムラインで読めない事故を防ぐための閾値をここに集約する。
// 自動で直すのではなく、まず知らせる（判断は作る人に残す）。
// ─────────────────────────────────────────────────────────

/** OGP フレームの実寸（note 推奨の書き出しサイズ） */
export const FRAME_WIDTH = 1280;
export const FRAME_HEIGHT = 670;

/**
 * note タイムライン実寸相当のカード幅(px)。
 * モバイル（375px 級端末）のタイムラインではカード画像がほぼ画面幅いっぱいに
 * 並ぶため、375 − 左右余白 16×2 = 343px を実寸とみなす。PC のグリッド表示は
 * さらに小さいことがあるが、閲覧の主流であるモバイルを基準にする。
 */
export const TIMELINE_CARD_WIDTH = 343;

/** 1280px 基準 → タイムライン実寸への縮小率（≈ 0.268） */
export const TIMELINE_SCALE = TIMELINE_CARD_WIDTH / FRAME_WIDTH;

/** Web の最小可読文字サイズ(px)。書籍の経験則に従う */
const MIN_READABLE_PX = 10;

/**
 * AutoFitTitle の確定フォントサイズ（1280px 基準）の警告閾値。
 * タイムライン縮小後に 10px を割り込む手前の値:
 * ceil(10 ÷ (343/1280)) = 38px。これ未満なら「タイムラインで読めない可能性」。
 */
export const TITLE_FONT_WARN_PX = Math.ceil(MIN_READABLE_PX / TIMELINE_SCALE);

/**
 * タイトル文字色×背景のコントラスト比の警告閾値。
 * WCAG AA の通常テキスト基準 4.5:1。タイトルはフレーム上では大きな文字だが、
 * タイムラインでは 10px 級の小さな文字になるため、大きなテキスト向けの
 * 3:1 ではなく通常テキストの基準を使う。
 */
export const CONTRAST_WARN_RATIO = 4.5;

/**
 * タイトル文字色と背景色（テーマ解決後）の WCAG コントラスト比を返す。
 *
 * 対象は「タイトルが単色の base 面に載る」構図だけ:
 * - Edition / Quiet / Cover の片寄せ・角版 → sub（文字）× base（背景）
 * - Cover の全面（写真背景）→ 背景色が一意に決まらないため対象外（null）。
 *   写真上の可読性はテンプレ側のスクリムが担保する。
 *
 * 質感レイヤー（紙・グラデ・図形）は base 色が支配的なまま薄く乗る程度なので、
 * base 色での近似計測とする。
 */
export function titleContrast(f: Fields): number | null {
	if (f.templateId === "cover" && f.photoLayout === "full") return null;
	const roles = paletteForSelection(f.palette, f.photoPalettes)[f.theme];
	return contrastRatio(roles.sub, roles.base);
}

/**
 * StatusBar の可読性インジケータが拾うサマリ。`level` は
 * - `ok`: タイムラインで読める想定（フォントサイズ・コントラストとも閾値内）
 * - `warn`: フォントサイズが閾値割れ寸前 or コントラスト低めの「気づき」レベル
 * - `bad`: 明確に読めない（フォントサイズが大幅に閾値割れ）
 * のいずれか。`reason` は短文（StatusBar の限られた幅に出す前提）。
 *
 * StatusBar 側は title が空 or titleFontSize が未確定なら呼ばずに「—」を出す。
 */
export type ReadabilityStatus = {
	level: "ok" | "warn" | "bad";
	reason: string;
};

export function getReadabilityStatus(
	f: Fields,
	titleFontSize: number | null,
): ReadabilityStatus {
	if (titleFontSize !== null && titleFontSize < TITLE_FONT_WARN_PX) {
		const onTimeline = Math.round(titleFontSize * TIMELINE_SCALE);
		const level = onTimeline <= 8 ? "bad" : "warn";
		return {
			level,
			reason: `タイムラインで小さい — 1 行を短くする（${onTimeline}px）`,
		};
	}
	const contrast = titleContrast(f);
	if (contrast !== null && contrast < CONTRAST_WARN_RATIO) {
		return {
			level: "warn",
			reason: `コントラスト低め ${contrast.toFixed(1)}:1`,
		};
	}
	return { level: "ok", reason: "タイムラインで読める" };
}
