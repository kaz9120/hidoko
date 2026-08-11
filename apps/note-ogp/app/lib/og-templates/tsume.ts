import { type CSSProperties, createElement, type ReactElement } from "react";

// ─────────────────────────────────────────────────────────
// 詰め（つめ）— 約物を字形単位で詰める
//
// Google Fonts の Shippori Mincho は palt / halt が一切効かない。和文は
// すべて 1em のベタ組みで、句読点や括弧も全角の送り幅を持つ。だから詰めは
// CSS の機能指定に任せず、文字クラス別の負マージンで自分で組む。
// ─────────────────────────────────────────────────────────

// ────── 文字クラス ──────
const OPEN_BRACKETS = "「『（〔［｛〈《‘“";
const CLOSE_BRACKETS = "」』）〕］｝〉》’”";
const KUTOTEN = "、。，．";
const NAKATEN = "・：；";
const SMALL_KANA = "ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ";
const LATIN_RE = /[A-Za-z0-9]/;
const KANA_RE = /[぀-ヿ]/;

/** 和欧の境界に入れるアキ（四分アキ相当） */
const LATIN_GAP = 0.08;

export const TSUME_LEVELS = ["none", "kutoten", "full", "poster"] as const;
export type TsumeLevel = (typeof TSUME_LEVELS)[number];

/**
 * 詰めの強さ。open 〜 kana は em 単位で、その文字クラスの左右に入れる
 * 負マージンの量。base は行全体の字送り補正で、letterSpacing にそのまま渡す。
 */
export type TsumeMetrics = {
	/** 開き括弧の左 */
	open: number;
	/** 閉じ括弧の右 */
	close: number;
	/** 句読点の右 */
	kuto: number;
	/** 中点・コロン類の左右 */
	naka: number;
	/** 小書き仮名の左右 */
	small: number;
	/** かな一般の左右 */
	kana: number;
	/** letterSpacing に入れる全体の補正値 */
	base: string;
};

/**
 * 4 段階の詰め。閉じ括弧と句読点は半角分、中点は四分ずつ、小書き仮名は
 * ごくわずか。v10 の既定は poster（ポスター詰め）。
 */
export const TSUME: Record<TsumeLevel, TsumeMetrics> = {
	none: {
		open: 0,
		close: 0,
		kuto: 0,
		naka: 0,
		small: 0,
		kana: 0,
		base: "0.005em",
	},
	kutoten: {
		open: 0.42,
		close: 0.42,
		kuto: 0.46,
		naka: 0.24,
		small: 0,
		kana: 0,
		base: "0em",
	},
	full: {
		open: 0.44,
		close: 0.44,
		kuto: 0.48,
		naka: 0.25,
		small: 0.055,
		kana: 0.012,
		base: "-0.008em",
	},
	poster: {
		open: 0.46,
		close: 0.46,
		kuto: 0.5,
		naka: 0.26,
		small: 0.07,
		kana: 0.03,
		base: "-0.035em",
	},
};

// ラテンの連なりは和文書体ではなく Newsreader で組む。前後の四分アキと
// letterSpacing の打ち消しもここで持つ（親の base が効くと欧文が痩せるため）。
const LATIN_STYLE: CSSProperties = {
	fontFamily: "'Newsreader', serif",
	fontWeight: 500,
	marginLeft: `${LATIN_GAP}em`,
	marginRight: `${LATIN_GAP}em`,
	letterSpacing: "0",
};

/** 文字クラスから左右の負マージン量（em）を引く */
function marginsFor(ch: string, t: TsumeMetrics): [number, number] {
	if (OPEN_BRACKETS.includes(ch)) return [-t.open, 0];
	if (CLOSE_BRACKETS.includes(ch)) return [0, -t.close];
	if (KUTOTEN.includes(ch)) return [0, -t.kuto];
	if (NAKATEN.includes(ch)) return [-t.naka, -t.naka];
	if (SMALL_KANA.includes(ch)) return [-t.small, -t.small];
	if (KANA_RE.test(ch)) return [-t.kana, -t.kana];
	return [0, 0];
}

/**
 * タイトルを文字クラス別の span 列に分解する。
 *
 * ラテンと数字の連続は 1 つの span にまとめ、途中で行が割れないようにする。
 * key は元テキストの文字位置から作るので、再レンダリングで並びが揺れない。
 *
 * @param text 組む文字列。空文字・undefined なら空配列を返す
 * @param level 詰めの強さ。既定は poster
 */
export function tsumeSpans(
	text: string | undefined,
	level: TsumeLevel = "poster",
): ReactElement[] {
	const t = TSUME[level];
	// サロゲートペアを 1 文字として扱うため Array.from で分解する
	const chars = Array.from(text ?? "");
	const out: ReactElement[] = [];

	let latinBuf = "";
	let latinStart = 0;
	const flushLatin = () => {
		if (!latinBuf) return;
		out.push(
			createElement(
				"span",
				{ key: `l${latinStart}`, style: LATIN_STYLE },
				latinBuf,
			),
		);
		latinBuf = "";
	};

	// forEach ではなく for で回すのは、key に使う index を安定させるため
	for (let i = 0; i < chars.length; i++) {
		const ch = chars[i];
		if (LATIN_RE.test(ch)) {
			if (!latinBuf) latinStart = i;
			latinBuf += ch;
			continue;
		}
		flushLatin();
		const [ml, mr] = marginsFor(ch, t);
		out.push(
			createElement(
				"span",
				{
					key: `c${i}`,
					style: {
						marginLeft: ml ? `${ml}em` : undefined,
						marginRight: mr ? `${mr}em` : undefined,
					},
				},
				ch,
			),
		);
	}
	flushLatin();

	return out;
}
