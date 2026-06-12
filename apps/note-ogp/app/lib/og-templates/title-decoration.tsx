import type { CSSProperties, ReactNode } from "react";
import type { TitleDecoration } from "./types";

// ─────────────────────────────────────────────────────────
// タイトルの装飾プリセット
//   参考書（『けっきょくは、よはく。』ほか）の「影・グラデ・変形の盛りすぎが
//   安っぽさの典型。さりげない加工で十分目立つ」に従い、効果は控えめな
//   固定プリセットだけを出す。自由なシャドウ / グラデ設定 UI は提供しない。
//
//   - merihari: 助詞・繋ぎ言葉を少し小さくして名詞を立てる（メリハリ文字）
//   - zurashi:  複数行タイトルの行頭を半文字ずつオフセットする（ずらし文字）
//   - hanzure:  アクセント色のアウトラインを 3px ずらして重ねる（版ずれ風）
// ─────────────────────────────────────────────────────────

/** 助詞の縮小率。書籍の推奨レンジ 60〜70% の中庸 */
const MERIHARI_SCALE = "0.68em";
/** 行ずらしの 1 行あたりのオフセット（半文字弱） */
const ZURASHI_STEP_EM = 0.55;
/** 行ずらしの上限。4 行以上でも間延びさせない */
const ZURASHI_MAX_EM = 1.65;
/**
 * 版ずれのオフセットと線幅。標準のタイトルサイズ（約 90〜100px）で
 * 2〜3px 相当になる em 指定。AutoFitTitle が長文で文字を縮めたときも
 * フチが相対的に太らず、さりげなさが保たれる。
 */
const HANZURE_OFFSET = "0.033em";
const HANZURE_STROKE = "0.02em";

// 縮小対象の助詞・繋ぎ言葉の小辞書（長いものから先に照合する）。
// 誤検出よりも取りこぼしを許容する保守的な構成にしている。
const PARTICLES = [
	"という",
	"とは",
	"には",
	"では",
	"から",
	"まで",
	"より",
	"の",
	"を",
	"に",
	"で",
	"と",
	"は",
	"が",
	"へ",
] as const;

const HIRAGANA_RE = /[ぁ-ゖゝゞ]/; // ぁ-ゖ・ゝゞ

// 直前の文字で「語の一部」と分かるものを除外する辞書。
//   の: この・その・あの・どの・もの
//   と: こと・ひと・あと・〜ごと・もっと / ずっと（促音）
const PREV_EXCLUDE: Record<string, string> = {
	の: "こそあども",
	と: "こひあごっッ",
};

/**
 * line の位置 i から始まる助詞を返す。助詞でなければ null。
 *
 * 判定は保守的に倒す:
 * - 行頭は助詞にならない
 * - 直後がひらがなだと語の一部の可能性が高い（「きのこ」「ながら」）ので見送る
 *   （例外: 「を」は現代語で助詞にしかならないので直後を問わない）
 * - 「この」「こと」など、直前の文字で語の一部と分かるものは除外する
 */
function matchParticleAt(line: string, i: number): string | null {
	if (i === 0) return null;
	const prev = line[i - 1];
	for (const p of PARTICLES) {
		if (!line.startsWith(p, i)) continue;
		const next = line[i + p.length];
		if (p !== "を" && next !== undefined && HIRAGANA_RE.test(next)) continue;
		// 先頭文字で引く: 「ことは」の「とは」のような複合もまとめて除外する
		if (PREV_EXCLUDE[p[0]]?.includes(prev)) continue;
		return p;
	}
	return null;
}

export type MerihariToken = { text: string; particle: boolean };

/** 1 行をメリハリ文字用のトークン列に分割する（テストしやすいよう export） */
export function splitMerihari(line: string): MerihariToken[] {
	const tokens: MerihariToken[] = [];
	let plain = "";
	let i = 0;
	while (i < line.length) {
		const hit = matchParticleAt(line, i);
		if (hit) {
			if (plain) {
				tokens.push({ text: plain, particle: false });
				plain = "";
			}
			tokens.push({ text: hit, particle: true });
			i += hit.length;
		} else {
			plain += line[i];
			i += 1;
		}
	}
	if (plain) tokens.push({ text: plain, particle: false });
	return tokens;
}

function merihariLine(line: string): ReactNode {
	return splitMerihari(line).map((tok, i) =>
		tok.particle ? (
			// 同じ index は並び替えがないので安定する
			// biome-ignore lint/suspicious/noArrayIndexKey: stable order
			<span key={i} style={{ fontSize: MERIHARI_SCALE }}>
				{tok.text}
			</span>
		) : (
			// biome-ignore lint/suspicious/noArrayIndexKey: stable order
			<span key={i}>{tok.text}</span>
		),
	);
}

function zurashiStyle(lineIndex: number): CSSProperties | undefined {
	if (lineIndex === 0) return undefined;
	const offset = Math.min(lineIndex * ZURASHI_STEP_EM, ZURASHI_MAX_EM);
	return { paddingLeft: `${offset}em` };
}

/**
 * 版ずれ風フチ文字。アクセント色のアウトラインだけの複製を
 * 右下に 3px ずらして文字の下に敷く。
 *
 * text-shadow ではなく重ね DOM + -webkit-text-stroke にしているのは、
 * 「塗りの影」ではなく「輪郭線」が欲しいため（フチが塗りからはみ出す
 * ことで版ずれに見える）。html-to-image は computed style を複製するので
 * PNG 書き出しでもそのまま再現される。
 */
function hanzureLine(line: ReactNode, accent: string): ReactNode {
	return (
		<span style={{ position: "relative", display: "inline-block" }}>
			<span
				aria-hidden="true"
				style={{
					position: "absolute",
					left: HANZURE_OFFSET,
					top: HANZURE_OFFSET,
					color: "transparent",
					WebkitTextStroke: `${HANZURE_STROKE} ${accent}`,
					textShadow: "none",
				}}
			>
				{line}
			</span>
			<span style={{ position: "relative" }}>{line}</span>
		</span>
	);
}

/**
 * タイトル行の描画（renderLines の装飾対応版）。
 * 改行は手動指定どおりに分割し、自動では折り返さない（whiteSpace: pre）。
 * 装飾は分割後の行単位で適用するので、手動改行とそのまま共存する。
 */
export function renderTitleLines(
	text: string | undefined,
	decoration: TitleDecoration,
	accent: string,
): ReactNode[] {
	return (text ?? "").split("\n").map((line, i) => {
		const style = decoration === "zurashi" ? zurashiStyle(i) : undefined;
		let content: ReactNode;
		if (!line) {
			content = " ";
		} else if (decoration === "merihari") {
			content = merihariLine(line);
		} else if (decoration === "hanzure") {
			content = hanzureLine(line, accent);
		} else {
			content = line;
		}
		return (
			// 同じ index は並び替えがないので安定する
			// biome-ignore lint/suspicious/noArrayIndexKey: stable order
			<div key={i} style={style}>
				{content}
			</div>
		);
	});
}
