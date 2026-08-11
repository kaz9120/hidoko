// note-ogp v10 — 写真フルブリードを土台に固定し、号ごとに選ぶのは「組み」だけ。
// タイトルの居場所と号数の身振りは独立軸にせず、成立する 12 の組みと節目号の
// 3 変奏に畳んである。文字色・スクリム・ハロは写真の輝度から自動で決まるので、
// ユーザーは意匠の判断をしない。
//
// v3 の titleSlot / numberTreatment / numberOpts / 11 値の scrim は廃止した。

// ─────────────────────────────────────────────────────────
// 列挙値は配列を単一ソースにし、型と runtime validator の両方を
// ここから派生させる。次に値を増やしたとき片方だけ忘れて loadState()
// が静かにフォールバックする事故を防ぐため。
// ─────────────────────────────────────────────────────────

/**
 * 組み（Kumi）12 種。「タイトルの居場所」と「号数の身振り」をセットにした
 * 名前付きレイアウトで、この 2 つは分けて選ばせない。
 *
 * - a1: 定番（左下タイトル／右上コーナー号数）
 * - b1: 見出し（上に横長／右下プレート）
 * - b7: 上段右（右上・右揃え／左下コーナー）
 * - c1: 右柱（右に縦組み／左端フィルム縁）
 * - c11: 中柱・判上（中央縦組み／柱の真上に判）
 * - d5: 扉（中央・マストヘッドも中央／下部中央の判）
 * - d6: 中央大判（中央／背景に巨大数字）
 * - e7: 重心外し（中央左・縦センター／右端フィルム縁）
 * - f7: 浮き帯（下部の半透明帯の中／帯内右側）
 * - g7: 目次風（左下一行／点線リーダーで右の号数へ）
 * - g10: 対角巨大（左上／右下奥に巨大数字）
 * - h1: 静けさ（写真の静かな面へ自動配置／タイトルの尻に号数を添える）
 *
 * 並び順は組みセレクタのタイル順でもある。
 */
export const KUMI_IDS = [
	"a1",
	"b1",
	"b7",
	"c1",
	"c11",
	"d5",
	"d6",
	"e7",
	"f7",
	"g7",
	"g10",
	"h1",
] as const;
export type KumiId = (typeof KUMI_IDS)[number];

/**
 * 節目号の変奏 3 種。通常の組みとは別の族で、号数が主役になりタイトルは
 * 左下に回る。
 *
 * - watermark: M1 透かし（左上に巨大な斜体数字）
 * - hero: M2 主役（右下に巨大な斜体数字。screen 合成）
 * - kanji: M4 漢数字（右に縦書きの「第五十号」）
 */
export const MILESTONES = ["watermark", "hero", "kanji"] as const;
export type Milestone = (typeof MILESTONES)[number];

/**
 * 号の種類。milestone のとき、組みの選択は MILESTONES に入れ替わる。
 * kumi と milestone の値は互いに残したまま切り替える（戻したときに
 * 選び直さなくて済むようにするため）。
 */
export const MODES = ["normal", "milestone"] as const;
export type Mode = (typeof MODES)[number];

/**
 * v10 の Fields。写真は前提（image）。意匠の判断は組みの選択に集約し、
 * 残りは連載の固定情報とテキストだけ。
 */
export type Fields = {
	// 内容
	title: string;
	issue: string;
	date: string;

	// プロジェクト（連載の固定情報）。v10 の台紙が描くのはマストヘッドだけなので、
	// ブランド表記と炎マークの 2 つに絞る（著者名とアカウントは廃止）。
	brand: string;
	showMark: boolean;

	// 写真
	image: string | null;

	// 組み
	kumi: KumiId;
	mode: Mode;
	milestone: Milestone;

	/** スクリム。false = 自動（輝度から判定）、true = 強制的に敷く */
	scrim: boolean;
};
