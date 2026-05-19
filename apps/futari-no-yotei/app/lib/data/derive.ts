/**
 * 「確定 / 推定 / 未回答」を導出する純粋関数群。`lib/api/types.ts` の API 型を
 * 入力として受け取り、ステートを持たない。
 *
 * **なぜ helpers.ts と分けるか:** `helpers.ts` はプロトタイプ移行期の sample
 * data 直結ヘルパーで、近く廃止する。新しい本実装は全部こちらに寄せる。
 */

import type { ApiDayStatus, ApiStatusItem } from "~/lib/api/types";
import type { StatusOption, WeekdayKey } from "~/lib/types";

/** 曜日キー (Date.getDay() の 0..6 で引ける順)。日曜=0。 */
export const WEEKDAYS_KEY: readonly WeekdayKey[] = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat",
];

export const WEEKDAYS_JP = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** Date → "YYYY-MM-DD"。ローカルタイムで切る (UTC ずれ回避)。 */
export function isoKey(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
	const r = new Date(d);
	r.setDate(r.getDate() + n);
	return r;
}

/** 月曜始まりの週頭。週ビュー / WeekMatrix で使う。 */
export function startOfWeek(d: Date): Date {
	const r = new Date(d);
	const day = r.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	r.setDate(r.getDate() + diff);
	return r;
}

/**
 * `dateKey` (= "YYYY-MM-DD") から `Date` を作る。タイムゾーン差分でずれないよう、
 * 必ずローカル午前 0 時として解釈する。
 */
export function dateFromKey(dateKey: string): Date {
	return new Date(`${dateKey}T00:00:00`);
}

/**
 * 日付 × 項目 → 「確定 / 推定 / 未回答」の 3 状態のいずれか。
 *
 * 解決順:
 *   1. `statuses` に明示的な行があれば確定値 (confirmed=true)
 *   2. 項目に weekdayDefaults があれば推定値 (confirmed=false)
 *   3. どちらでもなければ `null` (= 未回答)
 *
 * 戻り値が `null` のセルは UI 側で「未回答ドット」相当の表現にする。
 */
export type ResolvedStatus = {
	optionId: string;
	confirmed: boolean;
};

export function resolveDayStatus(
	dateKey: string,
	item: ApiStatusItem,
	statuses: ApiDayStatus[],
): ResolvedStatus | null {
	const explicit = statuses.find(
		(s) => s.date === dateKey && s.statusItemId === item.id,
	);
	if (explicit) {
		return { optionId: explicit.optionId, confirmed: explicit.confirmed };
	}
	if (!item.weekdayDefaults) return null;
	const wk = WEEKDAYS_KEY[dateFromKey(dateKey).getDay()];
	const defaultOpt = item.weekdayDefaults[wk];
	if (!defaultOpt) return null;
	return { optionId: defaultOpt, confirmed: false };
}

export function getOption(
	item: ApiStatusItem,
	optionId: string,
): StatusOption | undefined {
	return item.options.find((o) => o.id === optionId);
}

/**
 * `anchor` (= 今日) から始まる 7 日分の日付キー配列。
 *
 * 「カレンダー的な今週 (月曜始まり)」ではなく、**今日を左端にした直近 1 週間**
 * を返す。ホームのマトリクスはユーザーが今日を起点に「向こう 1 週間で何が
 * 決まっていて何が決まっていないか」を見るための装置なので、左端が常に
 * 今日であることが要求される。月曜始まりの暦上の週は週ビュー (`/week`) が
 * 持つ。
 */
export function rollingWeekDateKeys(anchor: Date): string[] {
	return Array.from({ length: 7 }, (_, i) => isoKey(addDays(anchor, i)));
}
