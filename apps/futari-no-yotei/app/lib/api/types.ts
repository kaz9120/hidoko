/**
 * API レスポンス型。Worker 側のレスポンス契約と一致させる。
 * D1 のスキーマ (`worker/routes/status-items.ts` の `DbRow`) はサーバ内で
 * camelCase に正規化済み。クライアントは正規化後の型だけ見る。
 */

import type { Assignee, StatusOption, WeekdayKey } from "~/lib/types";

export type ApiStatusItem = {
	id: string;
	name: string;
	emoji: string;
	color: string;
	assignee: Assignee;
	sortOrder: number;
	options: StatusOption[];
	weekdayDefaults: Partial<Record<WeekdayKey, string>> | null;
};

export type CreateStatusItemPayload = {
	name: string;
	emoji: string;
	color?: string;
	assignee: Assignee;
	options: StatusOption[];
	weekdayDefaults?: Partial<Record<WeekdayKey, string>> | null;
};

/**
 * PATCH /api/status-items/:id の payload。すべて optional で、与えられた
 * フィールドだけが差分更新される。
 */
export type UpdateStatusItemPayload = Partial<{
	name: string;
	emoji: string;
	color: string;
	assignee: Assignee;
	options: StatusOption[];
	weekdayDefaults: Partial<Record<WeekdayKey, string>> | null;
}>;

/**
 * 日次ステータス確定値。サーバ側に保存されるのは確定値のみで、推定値
 * (weekdayDefaults から導出) はクライアントで計算する (`lib/data/derive.ts`)。
 */
export type ApiDayStatus = {
	date: string;
	statusItemId: string;
	optionId: string;
	confirmed: boolean;
	updatedBy: string;
	updatedAt: string;
};

/**
 * PUT /api/day-statuses の payload。`(date, statusItemId)` で upsert する。
 * `confirmed` はサーバ側で常に true。「未確定に戻す」は将来 DELETE で扱う。
 */
export type PutDayStatusPayload = {
	date: string;
	statusItemId: string;
	optionId: string;
};
