/**
 * 台紙に載せる日付文字列の書式。`2026.8.16` のように区切りはドット、月日は
 * ゼロ埋めしない。号数（`042`）はゼロ埋めするが、日付は連載の実際の表記に
 * 合わせて詰めない。
 *
 * 入力欄は手入力も受けるので、ここでは「読めたら Date、読めなければ
 * undefined」だけを決める。読めない文字列もユーザーの入力として保存し、
 * 台紙にはそのまま出す（勝手に書き換えない）。
 */

/** Date を `2026.8.16` の形にする。年は 4 桁に揃える（parser が 4 桁を要求するため） */
export function formatDateValue(date: Date): string {
	const year = String(date.getFullYear()).padStart(4, "0");
	return `${year}.${date.getMonth() + 1}.${date.getDate()}`;
}

/** 今日の日付を `2026.8.16` の形で返す。SSR では使わない（実行日に依存する） */
export function todayValue(): string {
	return formatDateValue(new Date());
}

// 区切りはドット・スラッシュ・ハイフンを許す。日は省略できる（旧形式の
// `2026.06` のような年月だけの保存値をそのまま読めるようにするため）。
const DATE_RE = /^\s*(\d{4})[./-](\d{1,2})(?:[./-](\d{1,2}))?\s*$/;

/**
 * 入力文字列を Date にする。読めない文字列と、2 月 31 日のように存在しない日付は
 * undefined を返す。日が無いときはその月の 1 日として読む。
 */
export function parseDateValue(value: string): Date | undefined {
	const matched = DATE_RE.exec(value);
	if (!matched) return undefined;
	const year = Number(matched[1]);
	const month = Number(matched[2]);
	const day = matched[3] === undefined ? 1 : Number(matched[3]);
	if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
	// new Date(year, ...) は 0〜99 を 1900 年代として読むので、年は setFullYear で入れる
	const date = new Date(0);
	date.setFullYear(year, month - 1, day);
	// 繰り上がり（2/31 → 3/3）を弾く
	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return undefined;
	}
	return date;
}
