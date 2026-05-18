// データ操作の共通ヘルパー。プロトタイプ data.js のロジックをそのまま TS 化。
// 「曜日デフォルト → 推定」の解決責任はここに集約する。

import type { DayStatus, Schedule, StatusOption } from "../types";
import { DAY_STATUSES, SCHEDULES, STATUS_ITEMS, WEEKDAYS_KEY } from "./sample";

/** Date → "YYYY-MM-DD"。ローカルタイムで切る (UTC ずれを避ける)。 */
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
 * ある日付 × 項目のステータスを返す。
 *
 * 解決順:
 *   1. DAY_STATUSES に明示的な確定値があればそれを返す（confirmed=true）
 *   2. 該当項目に weekdayDefaults があれば推定値を返す（confirmed=false）
 *   3. どちらでもなければ null（= 未回答）
 *
 * **Why:** 「決まった瞬間に更新する」哲学のため、確定 / 推定 / 未回答 の 3 状態
 * を UI で明確に区別する必要がある。この関数が唯一の判別ロジックの所在。
 */
export function dayStatus(dateKey: string, itemId: string): DayStatus | null {
	const items = DAY_STATUSES[dateKey] ?? {};
	const explicit = items[itemId];
	if (explicit) {
		// 保存値の `confirmed` をそのまま信頼する。サンプルデータでは現状すべて
		// true だが、将来 D1 から取ったとき「ユーザーが明示的に未確定として
		// 記録した」状態 (例: 「あとで決める」ボタン) を扱えるように残す。
		return { option: explicit.option, confirmed: explicit.confirmed };
	}
	const item = STATUS_ITEMS.find((i) => i.id === itemId);
	if (!item?.weekdayDefaults) return null;
	const d = new Date(`${dateKey}T00:00:00`);
	const wk = WEEKDAYS_KEY[d.getDay()];
	const defaultOpt = item.weekdayDefaults[wk];
	if (!defaultOpt) return null;
	return { option: defaultOpt, confirmed: false };
}

export function getOption(
	itemId: string,
	optionId: string,
): StatusOption | undefined {
	const item = STATUS_ITEMS.find((i) => i.id === itemId);
	return item?.options.find((o) => o.id === optionId);
}

export function schedulesOn(dateKey: string): Schedule[] {
	return SCHEDULES.filter((s) => s.date === dateKey);
}
