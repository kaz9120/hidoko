/**
 * `/api/status-items` ルート。ペアに紐づくステータス項目の CRUD。
 *
 * - `pair_id` は認証コンテキストから取る (クライアントから受け取らない)
 * - `options` / `weekday_defaults` は DB では JSON 文字列、API では構造化値
 */

import { Hono } from "hono";

type DbRow = {
	id: string;
	pair_id: string;
	name: string;
	emoji: string;
	color: string;
	assignee: "me" | "partner" | "both";
	sort_order: number;
	options: string;
	weekday_defaults: string | null;
	created_at: string;
	updated_at: string;
};

type ApiStatusItem = {
	id: string;
	name: string;
	emoji: string;
	color: string;
	assignee: "me" | "partner" | "both";
	sortOrder: number;
	options: Array<{ id: string; label: string; emoji: string }>;
	weekdayDefaults: Record<string, string> | null;
};

function rowToApi(row: DbRow): ApiStatusItem {
	return {
		id: row.id,
		name: row.name,
		emoji: row.emoji,
		color: row.color,
		assignee: row.assignee,
		sortOrder: row.sort_order,
		options: JSON.parse(row.options),
		weekdayDefaults: row.weekday_defaults
			? JSON.parse(row.weekday_defaults)
			: null,
	};
}

/** 簡易 ID 生成。`si_<8 文字 hex>` 形式。 */
function newId(prefix = "si"): string {
	const bytes = new Uint8Array(4);
	crypto.getRandomValues(bytes);
	const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
		"",
	);
	return `${prefix}_${hex}`;
}

export const statusItemsRoute = new Hono<{ Bindings: Env }>();

statusItemsRoute.get("/", async (c) => {
	const { pairId } = c.get("auth");
	const rows = await c.env.DB.prepare(
		"SELECT * FROM status_items WHERE pair_id = ?1 ORDER BY sort_order, created_at",
	)
		.bind(pairId)
		.all<DbRow>();
	return c.json(rows.results.map(rowToApi));
});

type CreateBody = {
	name: string;
	emoji: string;
	color?: string;
	assignee: "me" | "partner" | "both";
	options: Array<{ id: string; label: string; emoji: string }>;
	weekdayDefaults?: Record<string, string> | null;
};

statusItemsRoute.post("/", async (c) => {
	const { pairId } = c.get("auth");
	const body = await c.req.json<CreateBody>();

	const errors = validateCreate(body);
	if (errors) {
		return c.json({ error: "validation failed", details: errors }, 400);
	}

	const id = newId();
	// 末尾に追加
	const max = await c.env.DB.prepare(
		"SELECT COALESCE(MAX(sort_order), -1) AS m FROM status_items WHERE pair_id = ?1",
	)
		.bind(pairId)
		.first<{ m: number }>();
	const sortOrder = (max?.m ?? -1) + 1;

	await c.env.DB.prepare(
		`INSERT INTO status_items
		   (id, pair_id, name, emoji, color, assignee, sort_order, options, weekday_defaults)
		 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
	)
		.bind(
			id,
			pairId,
			body.name,
			body.emoji,
			body.color ?? "var(--ember-400)",
			body.assignee,
			sortOrder,
			JSON.stringify(body.options),
			body.weekdayDefaults ? JSON.stringify(body.weekdayDefaults) : null,
		)
		.run();

	const row = await c.env.DB.prepare("SELECT * FROM status_items WHERE id = ?1")
		.bind(id)
		.first<DbRow>();

	return c.json(rowToApi(row as DbRow), 201);
});

function validateCreate(body: CreateBody): string[] | null {
	const errs: string[] = [];
	if (!body.name?.trim()) errs.push("name は必須です");
	if (!body.emoji?.trim()) errs.push("emoji は必須です");
	if (!["me", "partner", "both"].includes(body.assignee))
		errs.push("assignee は me / partner / both のいずれか");
	if (!Array.isArray(body.options) || body.options.length === 0)
		errs.push("options は 1 つ以上必要です");
	for (const o of body.options ?? []) {
		if (!o.id || !o.label || !o.emoji) {
			errs.push("options の各要素には id / label / emoji が必要");
			break;
		}
	}
	return errs.length ? errs : null;
}
