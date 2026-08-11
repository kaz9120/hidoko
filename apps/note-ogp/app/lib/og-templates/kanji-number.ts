// 節目号の M4（漢数字）で「第五十号」と組むための数字変換。
// 台紙以外では使わないので、扱う桁も号数として現実的な範囲に絞る。

const DIGITS = "〇一二三四五六七八九";

/** 大きい位から順に。位の頭が 1 のときは「一」を書かない（十/百/千） */
const UNITS: ReadonlyArray<[number, string]> = [
	[1000, "千"],
	[100, "百"],
	[10, "十"],
];

/**
 * 算用数字を漢数字にする。位の頭の 1 は書かない日本語の作法に従う。
 *
 * 期待値:
 * - 0 → 〇、1 → 一、9 → 九
 * - 10 → 十、11 → 十一、20 → 二十、25 → 二十五、50 → 五十、99 → 九十九
 * - 100 → 百、110 → 百十、999 → 九百九十九
 * - 1000 → 千、1234 → 千二百三十四
 *
 * 想定外の入力でも例外は投げない。数として読めない文字列（空文字・NaN）は
 * 〇、負数と 10000 以上は算用数字の文字列をそのまま返す（万以上の位を
 * 持たないため、無理に漢数字へ寄せず読める形に倒す）。
 *
 * @param value 号数。`Fields.issue` の文字列（"042" など）をそのまま渡せる
 */
export function kanjiNumber(value: string | number): string {
	const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
	if (!Number.isFinite(parsed)) return DIGITS[0];

	const num = Math.trunc(parsed);
	if (num < 0 || num > 9999) return String(num);
	if (num === 0) return DIGITS[0];

	let rest = num;
	let out = "";
	for (const [unit, label] of UNITS) {
		const count = Math.floor(rest / unit);
		if (count === 0) continue;
		// 位の頭が 1 のときは「一十」ではなく「十」と書く
		out += (count > 1 ? DIGITS[count] : "") + label;
		rest -= count * unit;
	}
	if (rest > 0) out += DIGITS[rest];
	return out;
}
