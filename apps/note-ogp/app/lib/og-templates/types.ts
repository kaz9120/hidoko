// note-ogp v3 — 写真フルブリードを土台に固定し、号ごとに変えるのは
// 「タイトルの居場所」「号数の身振り」「スクリムの方向」のみとする。
// 旧 templateId / palette / photoLayout 系はすべて廃止。

/**
 * タイトルの居場所（写真の暗部に文字を逃がす 6 パターン）。
 * - bl: 左下（標準。視線の流れ上「最後に来る」）
 * - br: 右下（左に被写体があるとき）
 * - tl: 左上ワードマーク下（写真の下が忙しいとき）
 * - center: 中央（強い被写体／対称な構図）
 * - rcol: 右コラム（縦長の文字組み・雑誌的）
 * - topwide: 上に横長（1 行の長いタイトル）
 */
export type TitleSlot = "bl" | "br" | "tl" | "center" | "rcol" | "topwide";

/**
 * 号数の身振り 5 種。N1 Corner が標準。N5 Watermark は節目号専用ルール。
 */
export type NumberTreatment =
	| "corner"
	| "vertical"
	| "written"
	| "plate"
	| "watermark";

/** N1 Corner / N4 Plate のときの配置コーナー */
export type NumberCorner = "tr" | "br" | "bl";
/** N2 Vertical のときの走らせる側 */
export type NumberSide = "left" | "right";

export type NumberOpts = {
	/** corner / plate のときの配置コーナー（タイトル位置に応じて自動切替） */
	corner?: NumberCorner;
	/** vertical のときの左右 */
	side?: NumberSide;
	/** written のときの絶対位置（左・下からの px） */
	position?: { left: number; bottom: number };
};

/**
 * 写真の上に重ねる暗部の方向。
 * "auto" は titleSlot から推定する（lb=左下が暗い、など）。
 */
export type Scrim =
	| "auto"
	| "lb"
	| "rb"
	| "lt"
	| "rt"
	| "t"
	| "b"
	| "l"
	| "r"
	| "c"
	| "none";

/**
 * v3 の Fields。写真は前提（image）。テキスト系・連載情報・身振りに収束。
 */
export type Fields = {
	// 内容
	title: string;
	lead: string;
	issue: string;
	date: string;
	category: string;

	// プロジェクト（連載の固定情報）
	brand: string;
	author: string;
	account: string;
	showMark: boolean;

	// 写真
	image: string | null;

	// 身振り
	titleSlot: TitleSlot;
	numberTreatment: NumberTreatment;
	numberOpts: NumberOpts;
	scrim: Scrim;
	showLead: boolean;
};
