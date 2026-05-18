/**
 * API クライアント。fetch ラッパで `X-Dev-User` を自動付与する (LIFF 接続前)。
 * 本番では LIFF SDK が返す ID トークンを `Authorization` ヘッダに載せる経路に
 * 差し替える (後続 PR)。
 *
 * セキュリティ境界: dev ヘッダはサーバ側 (`worker/auth.ts`) で
 * `env.ALLOW_DEV_AUTH === "true"` のときのみ受理される。本番 LIFF 化時に
 * `wrangler.jsonc` の `vars.ALLOW_DEV_AUTH` を `"false"` にすればクライアントが
 * 何を送っても 401 で弾かれる。本ファイルからも dev ヘッダ送信は同時に
 * 撤去する。
 */

import type {
	ApiDayStatus,
	ApiStatusItem,
	CreateStatusItemPayload,
	PutDayStatusPayload,
	UpdateStatusItemPayload,
} from "./types";

/**
 * 開発バイパス用のダミーユーザー ID。`X-Dev-User` ヘッダで Worker の
 * 認証ミドルウェアに渡され、`users.id = 'u_me'` の行が解決される
 * (`seed/dev.sql` 参照)。
 */
const DEV_USER = "u_me";

function defaultHeaders(): HeadersInit {
	return {
		"Content-Type": "application/json",
		"X-Dev-User": DEV_USER,
	};
}

class ApiError extends Error {
	constructor(
		public status: number,
		public body: unknown,
	) {
		super(`API ${status}: ${JSON.stringify(body)}`);
		this.name = "ApiError";
	}
}

async function request<T>(
	method: string,
	path: string,
	body?: unknown,
): Promise<T> {
	const res = await fetch(path, {
		method,
		headers: defaultHeaders(),
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const text = await res.text();
	// JSON で返らないケース (Worker のエラー応答が HTML / プレーンテキスト等)
	// に備え、parse 失敗時は生テキストを ApiError のボディに載せる。
	let parsed: unknown = null;
	let parseFailed = false;
	if (text) {
		try {
			parsed = JSON.parse(text);
		} catch {
			parsed = text;
			parseFailed = true;
		}
	}
	// 4xx / 5xx は body 形式によらず ApiError へ正規化
	if (!res.ok) throw new ApiError(res.status, parsed);
	// 2xx でも「JSON が返る契約」を満たさなければサーバ側の想定外応答として
	// 弾く。呼び出し側で生テキストや null を `T` として扱って実行時エラーに
	// 落ちるのを防ぐ。
	if (parseFailed) {
		throw new ApiError(res.status, {
			error: "invalid json response",
			raw: parsed,
		});
	}
	if (parsed === null) {
		throw new ApiError(res.status, "empty response body");
	}
	return parsed as T;
}

export const api = {
	statusItems: {
		list: () => request<ApiStatusItem[]>("GET", "/api/status-items"),
		create: (payload: CreateStatusItemPayload) =>
			request<ApiStatusItem>("POST", "/api/status-items", payload),
		update: (id: string, payload: UpdateStatusItemPayload) =>
			request<ApiStatusItem>("PATCH", `/api/status-items/${id}`, payload),
		remove: (id: string) =>
			request<{ ok: true }>("DELETE", `/api/status-items/${id}`),
	},
	dayStatuses: {
		list: (from: string, to: string) =>
			request<ApiDayStatus[]>(
				"GET",
				`/api/day-statuses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
			),
		put: (payload: PutDayStatusPayload) =>
			request<ApiDayStatus>("PUT", "/api/day-statuses", payload),
	},
};

export { ApiError };
