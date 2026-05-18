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
