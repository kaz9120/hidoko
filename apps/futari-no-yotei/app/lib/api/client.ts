/**
 * API クライアント。fetch ラッパで `X-Dev-User` を自動付与する (LIFF 接続前)。
 * 本番では LIFF SDK が返す ID トークンを `Authorization` ヘッダに載せる経路に
 * 差し替える (後続 PR)。
 */

import type { ApiStatusItem, CreateStatusItemPayload } from "./types";

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
	const json: unknown = text ? JSON.parse(text) : null;
	if (!res.ok) throw new ApiError(res.status, json);
	return json as T;
}

export const api = {
	statusItems: {
		list: () => request<ApiStatusItem[]>("GET", "/api/status-items"),
		create: (payload: CreateStatusItemPayload) =>
			request<ApiStatusItem>("POST", "/api/status-items", payload),
	},
};

export { ApiError };
