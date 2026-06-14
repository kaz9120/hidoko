// SPA から Worker の /api/* を呼ぶラッパ。サーバー側のレスポンス型をここに集約する。

export interface SignupRequest {
	email: string;
	password: string;
	termsAccepted: boolean;
}

export interface SignupResponse {
	ok: true;
	email: string;
	// dev で sender 未設定のとき、トークンを返してメール表示の代わりに使えるようにする。
	devVerifyUrl?: string;
}

export interface SigninRequest {
	email: string;
	password: string;
	returnTo?: string;
}

export interface SigninResponse {
	ok: true;
	// signin 完了後の遷移先（/oauth/return?next=… か /signin?email=… のどちらか）。
	redirectTo: string;
}

export interface ApiErrorBody {
	ok: false;
	error: string;
	code?: string;
}

export class ApiError extends Error {
	code: string | undefined;
	status: number;
	constructor(status: number, message: string, code?: string) {
		super(message);
		this.code = code;
		this.status = status;
	}
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
	const res = await fetch(path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
		credentials: "same-origin",
	});
	const text = await res.text();
	let parsed: unknown = null;
	try {
		parsed = text ? JSON.parse(text) : null;
	} catch {
		// ignore — fall through to error
	}
	if (!res.ok || !parsed || typeof parsed !== "object") {
		const body = (parsed ?? {}) as Partial<ApiErrorBody>;
		throw new ApiError(
			res.status,
			body.error ?? `HTTP ${res.status}`,
			body.code,
		);
	}
	const obj = parsed as { ok?: boolean };
	if (obj.ok !== true) {
		const body = parsed as Partial<ApiErrorBody>;
		throw new ApiError(
			res.status,
			body.error ?? `HTTP ${res.status}`,
			body.code,
		);
	}
	return parsed as T;
}

export function signup(req: SignupRequest): Promise<SignupResponse> {
	return postJson<SignupResponse>("/api/signup", req);
}

export function signin(req: SigninRequest): Promise<SigninResponse> {
	return postJson<SigninResponse>("/api/signin", req);
}
