/**
 * `/api/day-statuses` ルート。ペアに紐づく日次ステータス確定値の取得・upsert。
 *
 * 設計上のポイント:
 * - 推定値 (weekday_defaults から導出) は保存しない。クライアント側で計算する。
 *   ここでは確定値のみを保管する。
 * - upsert は (pair_id, date, status_item_id) を一意キーとする。`PUT` の冪等性。
 * - `pair_id` は常に認証コンテキストから取り、クライアントから受け取らない。
 */

import { Hono } from "hono";

type DbRow = {
	pair_id: string;
	date: string;
	status_item_id: string;
	option_id: string;
	confirmed: number;
	updated_by: string;
	updated_at: string;
};

type ApiDayStatus = {
	date: string;
	statusItemId: string;
	optionId: string;
	confirmed: boolean;
	updatedBy: string;
	updatedAt: string;
};

function rowToApi(row: DbRow): ApiDayStatus {
	return {
		date: row.date,
		statusItemId: row.status_item_id,
		optionId: row.option_id,
		confirmed: row.confirmed === 1,
		updatedBy: row.updated_by,
		updatedAt: row.updated_at,
	};
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 範囲取得が一度に許容する最大日数。過大な範囲で D1 を疲弊させない上限。 */
const MAX_RANGE_DAYS = 31;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const dayStatusesRoute = new Hono<{ Bindings: Env }>();

/**
 * 範囲取得。`from` / `to` は YYYY-MM-DD 形式の inclusive 範囲。
 * 範囲未指定なら全件 (ペア内) を返す。範囲指定時は最大 31 日に制限する。
 */
dayStatusesRoute.get("/", async (c) => {
	const { pairId } = c.get("auth");
	const from = c.req.query("from");
	const to = c.req.query("to");

	if ((from && !ISO_DATE_RE.test(from)) || (to && !ISO_DATE_RE.test(to))) {
		return c.json({ error: "from / to must be YYYY-MM-DD" }, 400);
	}
	if (from && to && from > to) {
		return c.json({ error: "from must be <= to" }, 400);
	}
	if (from && to) {
		// 文字列比較は `>` までしか担保できないので、日数差は `Date` 換算で見る。
		// ISO_DATE_RE を通っているので `Date.parse` は安全。
		const days =
			Math.floor((Date.parse(to) - Date.parse(from)) / MS_PER_DAY) + 1;
		if (days > MAX_RANGE_DAYS) {
			return c.json(
				{ error: `date range must be at most ${MAX_RANGE_DAYS} days` },
				400,
			);
		}
	}

	const rows = await (from && to
		? c.env.DB.prepare(
				`SELECT * FROM day_statuses
				   WHERE pair_id = ?1 AND date >= ?2 AND date <= ?3
				   ORDER BY date, status_item_id`,
			).bind(pairId, from, to)
		: c.env.DB.prepare(
				`SELECT * FROM day_statuses
				   WHERE pair_id = ?1
				   ORDER BY date, status_item_id`,
			).bind(pairId)
	).all<DbRow>();

	return c.json(rows.results.map(rowToApi));
});

type UpsertBody = {
	date: string;
	statusItemId: string;
	optionId: string;
};

function isObject(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateUpsert(body: unknown): string[] | null {
	if (!isObject(body)) {
		return ["request body は object である必要があります"];
	}
	const errs: string[] = [];
	const { date, statusItemId, optionId } = body;
	if (typeof date !== "string" || !ISO_DATE_RE.test(date)) {
		errs.push("date は YYYY-MM-DD 形式の string");
	}
	if (typeof statusItemId !== "string" || !statusItemId.trim()) {
		errs.push("statusItemId は必須");
	}
	if (typeof optionId !== "string" || !optionId.trim()) {
		errs.push("optionId は必須");
	}
	return errs.length ? errs : null;
}

/**
 * 確定値の upsert。`PUT` は冪等。`(pair_id, date, status_item_id)` で既存があれば
 * `option_id` を上書きする。`option_id` が status_items の options に含まれるか
 * は API 側では検査しない (将来 PR で添付するかも)。
 *
 * 注意: 「未確定に戻す」操作は `confirmed=0` を残す方針ではなく、行を削除する
 * 設計にする (`DELETE` 経路で後続 PR)。`confirmed` 列は将来「自動推定をユーザー
 * 確認した」ような中間状態を表すために予約してあるが、本 PR では常に 1。
 */
dayStatusesRoute.put("/", async (c) => {
	const { userId, pairId } = c.get("auth");
	let raw: unknown;
	try {
		raw = await c.req.json();
	} catch {
		return c.json({ error: "invalid json body" }, 400);
	}

	const errors = validateUpsert(raw);
	if (errors) {
		return c.json({ error: "validation failed", details: errors }, 400);
	}
	const body = raw as UpsertBody;
	// 検証時 `trim()` で空白のみを弾いたが、前後の空白付き値はそのまま通る。
	// "abc " と "abc" が別行として認識されて重複したり、検索で漏れたりするのを
	// 防ぐため、保存も trim 済み値で揃える (status-items.ts と同じ方針)。
	const statusItemId = body.statusItemId.trim();
	const optionId = body.optionId.trim();

	// status_item_id がこの pair に属することを確認 (他ペアの id を指定して
	// 横断的に書き込めないようにする最終ガード)
	const owned = await c.env.DB.prepare(
		"SELECT id FROM status_items WHERE id = ?1 AND pair_id = ?2",
	)
		.bind(statusItemId, pairId)
		.first<{ id: string }>();
	if (!owned) return c.json({ error: "status item not found" }, 404);

	await c.env.DB.prepare(
		`INSERT INTO day_statuses (pair_id, date, status_item_id, option_id, confirmed, updated_by, updated_at)
		 VALUES (?1, ?2, ?3, ?4, 1, ?5, datetime('now'))
		 ON CONFLICT (pair_id, date, status_item_id) DO UPDATE SET
		   option_id = excluded.option_id,
		   confirmed = 1,
		   updated_by = excluded.updated_by,
		   updated_at = excluded.updated_at`,
	)
		.bind(pairId, body.date, statusItemId, optionId, userId)
		.run();

	const row = await c.env.DB.prepare(
		"SELECT * FROM day_statuses WHERE pair_id = ?1 AND date = ?2 AND status_item_id = ?3",
	)
		.bind(pairId, body.date, statusItemId)
		.first<DbRow>();
	if (!row)
		return c.json({ error: "internal: upsert did not produce row" }, 500);
	return c.json(rowToApi(row));
});
