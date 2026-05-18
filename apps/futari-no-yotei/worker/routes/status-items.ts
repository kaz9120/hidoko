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
	let raw: unknown;
	try {
		raw = await c.req.json();
	} catch {
		return c.json({ error: "invalid json body" }, 400);
	}

	const errors = validateCreate(raw);
	if (errors) {
		return c.json({ error: "validation failed", details: errors }, 400);
	}
	// validateCreate を通った時点で raw は CreateBody の形を満たす
	const body = raw as CreateBody;

	const id = newId();
	// 末尾に追加
	const max = await c.env.DB.prepare(
		"SELECT COALESCE(MAX(sort_order), -1) AS m FROM status_items WHERE pair_id = ?1",
	)
		.bind(pairId)
		.first<{ m: number }>();
	const sortOrder = (max?.m ?? -1) + 1;

	// 検証時は trim 済み値を見ているので、保存も trim 済みに揃える。
	// 末尾空白付きデータが混入すると重複判定や表示整合性が崩れるため。
	const name = body.name.trim();
	const emoji = body.emoji.trim();

	await c.env.DB.prepare(
		`INSERT INTO status_items
		   (id, pair_id, name, emoji, color, assignee, sort_order, options, weekday_defaults)
		 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
	)
		.bind(
			id,
			pairId,
			name,
			emoji,
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

type UpdateBody = Partial<{
	name: string;
	emoji: string;
	color: string;
	assignee: "me" | "partner" | "both";
	options: Array<{ id: string; label: string; emoji: string }>;
	weekdayDefaults: Record<string, string> | null;
}>;

statusItemsRoute.patch("/:id", async (c) => {
	const { pairId } = c.get("auth");
	const id = c.req.param("id");
	let raw: unknown;
	try {
		raw = await c.req.json();
	} catch {
		return c.json({ error: "invalid json body" }, 400);
	}

	const errors = validateUpdate(raw);
	if (errors) {
		return c.json({ error: "validation failed", details: errors }, 400);
	}
	const body = raw as UpdateBody;

	const existing = await c.env.DB.prepare(
		"SELECT id FROM status_items WHERE id = ?1 AND pair_id = ?2",
	)
		.bind(id, pairId)
		.first<{ id: string }>();
	if (!existing) return c.json({ error: "not found" }, 404);

	// 与えられたフィールドだけを UPDATE する。`pair_id` は変更不可。
	const sets: string[] = [];
	const binds: unknown[] = [];
	let pos = 1;
	if (body.name !== undefined) {
		sets.push(`name = ?${pos++}`);
		binds.push(body.name.trim());
	}
	if (body.emoji !== undefined) {
		sets.push(`emoji = ?${pos++}`);
		binds.push(body.emoji.trim());
	}
	if (body.color !== undefined) {
		sets.push(`color = ?${pos++}`);
		binds.push(body.color);
	}
	if (body.assignee !== undefined) {
		sets.push(`assignee = ?${pos++}`);
		binds.push(body.assignee);
	}
	if (body.options !== undefined) {
		sets.push(`options = ?${pos++}`);
		binds.push(JSON.stringify(body.options));
	}
	if (body.weekdayDefaults !== undefined) {
		sets.push(`weekday_defaults = ?${pos++}`);
		binds.push(
			body.weekdayDefaults ? JSON.stringify(body.weekdayDefaults) : null,
		);
	}

	if (sets.length > 0) {
		sets.push(`updated_at = datetime('now')`);
		await c.env.DB.prepare(
			`UPDATE status_items SET ${sets.join(", ")} WHERE id = ?${pos++} AND pair_id = ?${pos}`,
		)
			.bind(...binds, id, pairId)
			.run();
	}

	const row = await c.env.DB.prepare("SELECT * FROM status_items WHERE id = ?1")
		.bind(id)
		.first<DbRow>();
	// UPDATE と再取得の間に並行リクエストで削除される可能性があるので、
	// `as DbRow` で握り潰さず null を 404 として返す。
	if (!row) return c.json({ error: "not found" }, 404);
	return c.json(rowToApi(row));
});

statusItemsRoute.delete("/:id", async (c) => {
	const { pairId } = c.get("auth");
	const id = c.req.param("id");

	const existing = await c.env.DB.prepare(
		"SELECT id FROM status_items WHERE id = ?1 AND pair_id = ?2",
	)
		.bind(id, pairId)
		.first<{ id: string }>();
	if (!existing) return c.json({ error: "not found" }, 404);

	// 要件 4.1.4 に従い、関連する day_statuses も同時に実削除する。FK 制約に
	// よる依存順を守るために day_statuses → status_items の順で。`batch` は
	// 単一トランザクションで両方を流す。
	await c.env.DB.batch([
		c.env.DB.prepare(
			"DELETE FROM day_statuses WHERE pair_id = ?1 AND status_item_id = ?2",
		).bind(pairId, id),
		c.env.DB.prepare(
			"DELETE FROM status_items WHERE id = ?1 AND pair_id = ?2",
		).bind(id, pairId),
	]);

	return c.json({ ok: true });
});

function isObject(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isValidOptionsArray(value: unknown): boolean {
	if (!Array.isArray(value) || value.length === 0) return false;
	for (const o of value) {
		if (
			!isObject(o) ||
			typeof o.id !== "string" ||
			typeof o.label !== "string" ||
			typeof o.emoji !== "string"
		) {
			return false;
		}
	}
	return true;
}

function isValidWeekdayDefaults(value: unknown): boolean {
	if (value === null) return true;
	if (!isObject(value)) return false;
	for (const v of Object.values(value)) {
		if (typeof v !== "string") return false;
	}
	return true;
}

/**
 * 入力 body の形を runtime で検査する。validate 通過後の `as CreateBody` を
 * 安全にするために、型保証を文字列・配列の各要素まで降りて確認する。
 */
function validateCreate(body: unknown): string[] | null {
	if (!isObject(body)) {
		return ["request body は object である必要があります"];
	}
	const errs: string[] = [];
	const { name, emoji, assignee, options } = body;
	if (typeof name !== "string" || !name.trim()) errs.push("name は必須です");
	if (typeof emoji !== "string" || !emoji.trim()) errs.push("emoji は必須です");
	if (assignee !== "me" && assignee !== "partner" && assignee !== "both") {
		errs.push("assignee は me / partner / both のいずれか");
	}
	if (!isValidOptionsArray(options)) {
		errs.push("options は id / label / emoji を持つ要素を 1 つ以上必要です");
	}
	return errs.length ? errs : null;
}

/**
 * PATCH 用の検査。全フィールド optional だが、与えられた場合は型と空文字
 * チェックを行う。create と違って「未提供」と「無効値」を区別する。
 */
function validateUpdate(body: unknown): string[] | null {
	if (!isObject(body)) {
		return ["request body は object である必要があります"];
	}
	const errs: string[] = [];
	const { name, emoji, color, assignee, options, weekdayDefaults } = body;
	if (name !== undefined && (typeof name !== "string" || !name.trim())) {
		errs.push("name を更新するなら空文字不可");
	}
	if (emoji !== undefined && (typeof emoji !== "string" || !emoji.trim())) {
		errs.push("emoji を更新するなら空文字不可");
	}
	if (color !== undefined && typeof color !== "string") {
		errs.push("color は string");
	}
	if (
		assignee !== undefined &&
		assignee !== "me" &&
		assignee !== "partner" &&
		assignee !== "both"
	) {
		errs.push("assignee は me / partner / both");
	}
	if (options !== undefined && !isValidOptionsArray(options)) {
		errs.push("options は id / label / emoji を持つ要素を 1 つ以上必要です");
	}
	if (
		weekdayDefaults !== undefined &&
		!isValidWeekdayDefaults(weekdayDefaults)
	) {
		errs.push("weekdayDefaults は string 値の object または null");
	}
	return errs.length ? errs : null;
}
