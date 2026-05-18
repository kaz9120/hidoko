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

function isObject(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
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
	if (!Array.isArray(options) || options.length === 0) {
		errs.push("options は 1 つ以上必要です");
	} else {
		for (const o of options) {
			if (
				!isObject(o) ||
				typeof o.id !== "string" ||
				typeof o.label !== "string" ||
				typeof o.emoji !== "string"
			) {
				errs.push("options の各要素には id / label / emoji が必要");
				break;
			}
		}
	}
	return errs.length ? errs : null;
}
