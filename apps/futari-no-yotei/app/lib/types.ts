// 「ふたりのよてい」のドメイン型。後続 PR で D1 に置き換えるときも、この
// 型を入出力境界として保つ。

export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/**
 * 誰がそのステータス項目を決めるか。
 *   - "me"      : 自分が決める
 *   - "partner" : 相手が決める（自分のホームでは「LINE で聞く」CTA を出す）
 *   - "both"    : ふたりで決める（どちらでも更新できる）
 */
export type Assignee = "me" | "partner" | "both";

/** 予定の主体。"self" / "partner" / "both" + 自由ラベル拡張余地。 */
export type Whose = "self" | "partner" | "both" | (string & {});

export type StatusOption = {
	id: string;
	label: string;
	emoji: string;
};

export type WeekdayDefaults = Partial<Record<WeekdayKey, string>>;

export type StatusItem = {
	id: string;
	name: string;
	emoji: string;
	color: string;
	assignee: Assignee;
	options: StatusOption[];
	weekdayDefaults?: WeekdayDefaults;
};

/**
 * 日付 × 項目 のステータス。
 *   - confirmed = true : 確定値（誰かが明示的に確定した）
 *   - confirmed = false: 推定値（曜日デフォルトから生成）
 * いずれでもないキーは未回答として扱う（dayStatus が null を返す）。
 */
export type DayStatus = {
	option: string;
	confirmed: boolean;
};

export type Location = {
	name: string;
	address?: string;
	lat?: number;
	lng?: number;
	mapUrl?: string;
};

export type Schedule = {
	id: string;
	/** ISO 形式 YYYY-MM-DD */
	date: string;
	/** HH:mm 形式。allDay=true のときは undefined */
	time?: string;
	endTime?: string;
	allDay: boolean;
	title: string;
	whose: Whose;
	location?: Location;
	url?: string;
	notes?: string;
	/** LINE 取り込み Bot 経由で作られたか */
	fromLine?: boolean;
	/** 記念日フラグ。ホームと日詳細で強調表示する */
	anniversary?: boolean;
};

export type User = {
	id: string;
	name: string;
	/** アバターの 1 文字表示用 */
	initial: string;
	/** ユーザー固有の差し色（CSS color 値） */
	tone: string;
};
