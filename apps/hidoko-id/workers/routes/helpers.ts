// JSON レスポンスの共通ヘルパ。エラーの shape は SPA 側 `lib/auth-api.ts` の
// `ApiErrorBody` と一致させる。

interface JsonInit {
	headers?: HeadersInit;
}

export function jsonOk<T extends object>(
	body: T,
	init: JsonInit = {},
): Response {
	return new Response(JSON.stringify({ ok: true, ...body }), {
		status: 200,
		headers: mergeHeaders(
			{ "Content-Type": "application/json; charset=utf-8" },
			init.headers,
		),
	});
}

export function jsonError(
	status: number,
	error: string,
	code?: string,
	init: JsonInit = {},
): Response {
	return new Response(
		JSON.stringify({ ok: false, error, ...(code ? { code } : {}) }),
		{
			status,
			headers: mergeHeaders(
				{ "Content-Type": "application/json; charset=utf-8" },
				init.headers,
			),
		},
	);
}

export async function readJson<T>(request: Request): Promise<T | null> {
	const ct = request.headers.get("content-type") ?? "";
	if (!ct.includes("application/json")) return null;
	try {
		return (await request.json()) as T;
	} catch {
		return null;
	}
}

function mergeHeaders(
	a: Record<string, string>,
	b: HeadersInit | undefined,
): HeadersInit {
	if (!b) return a;
	const h = new Headers(a);
	for (const [key, value] of new Headers(b)) {
		h.set(key, value);
	}
	return h;
}
