// /account 配下から呼ぶ /api/* のラッパ。401 を ApiError として bubble up する。

import { ApiError } from "./auth-api";

export interface MeResponse {
	ok: true;
	user: {
		id: string;
		email: string;
		emailVerified: boolean;
		displayName: string | null;
		avatarUrl: string | null;
	};
}

export interface SessionSummary {
	id: string;
	createdAt: number;
	expiresAt: number;
	lastSeenAt: number | null;
	userAgent: string | null;
	ip: string | null;
	isCurrent: boolean;
}

export interface SessionsResponse {
	ok: true;
	sessions: SessionSummary[];
}

async function readJsonOk<T>(res: Response): Promise<T> {
	const text = await res.text();
	let parsed: unknown = null;
	try {
		parsed = text ? JSON.parse(text) : null;
	} catch {
		// fall through
	}
	const body = (parsed ?? {}) as {
		ok?: boolean;
		error?: string;
		code?: string;
	};
	if (!res.ok || body.ok !== true) {
		throw new ApiError(
			res.status,
			body.error ?? `HTTP ${res.status}`,
			body.code,
		);
	}
	return parsed as T;
}

export async function fetchMe(): Promise<MeResponse> {
	const res = await fetch("/api/me", { credentials: "same-origin" });
	return readJsonOk<MeResponse>(res);
}

export async function fetchSessions(): Promise<SessionsResponse> {
	const res = await fetch("/api/sessions", { credentials: "same-origin" });
	return readJsonOk<SessionsResponse>(res);
}

export async function revokeSession(id: string): Promise<void> {
	const res = await fetch(`/api/sessions/${encodeURIComponent(id)}/revoke`, {
		method: "POST",
		credentials: "same-origin",
	});
	await readJsonOk<{ ok: true }>(res);
}

export async function revokeOtherSessions(): Promise<number> {
	const res = await fetch("/api/sessions/revoke-others", {
		method: "POST",
		credentials: "same-origin",
	});
	const json = await readJsonOk<{ ok: true; revoked: number }>(res);
	return json.revoked;
}

export async function signout(): Promise<void> {
	const res = await fetch("/api/signout", {
		method: "POST",
		credentials: "same-origin",
	});
	if (!res.ok) {
		throw new ApiError(res.status, "サインアウトに失敗");
	}
}

export interface UpdateProfileBody {
	displayName: string | null;
	avatarUrl: string | null;
}

export async function updateProfile(
	body: UpdateProfileBody,
): Promise<MeResponse> {
	const res = await fetch("/api/account", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		credentials: "same-origin",
		body: JSON.stringify(body),
	});
	return readJsonOk<MeResponse>(res);
}

export interface ChangePasswordBody {
	currentPassword?: string;
	newPassword: string;
}

export async function changePassword(body: ChangePasswordBody): Promise<void> {
	const res = await fetch("/api/account/password", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "same-origin",
		body: JSON.stringify(body),
	});
	await readJsonOk<{ ok: true }>(res);
}

export interface RequestEmailChangeBody {
	newEmail: string;
}

export interface RequestEmailChangeResponse {
	ok: true;
	newEmail: string;
	devVerifyUrl?: string;
}

export async function requestEmailChange(
	body: RequestEmailChangeBody,
): Promise<RequestEmailChangeResponse> {
	const res = await fetch("/api/account/email", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "same-origin",
		body: JSON.stringify(body),
	});
	return readJsonOk<RequestEmailChangeResponse>(res);
}

export interface DeleteAccountBody {
	confirmEmail: string;
}

export async function deleteAccount(body: DeleteAccountBody): Promise<void> {
	const res = await fetch("/api/account", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		credentials: "same-origin",
		body: JSON.stringify(body),
	});
	await readJsonOk<{ ok: true }>(res);
}
