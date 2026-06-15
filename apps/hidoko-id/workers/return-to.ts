import type { Env } from "./types";

/**
 * `?return_to` の URL がファーストパーティ allowlist と一致するかを最終判定する。
 * UI 側の `lib/return-to.ts` は表示用の軽量チェックで、これがサーバー側の決定的な版。
 */
export function isAllowedReturnTo(env: Env, returnTo: string | null): boolean {
	if (!returnTo) return false;
	const allowed = parseAllowedOrigins(env.FIRST_PARTY_ORIGINS);
	let url: URL;
	try {
		url = new URL(returnTo);
	} catch {
		return false;
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") return false;
	const candidate = `${url.protocol}//${url.host}`;
	return allowed.includes(candidate);
}

function parseAllowedOrigins(raw: string): string[] {
	return raw
		.split(",")
		.map((s) => s.trim())
		.filter((s) => s.length > 0)
		.map((s) => {
			try {
				const u = new URL(s);
				return `${u.protocol}//${u.host}`;
			} catch {
				return "";
			}
		})
		.filter((s) => s.length > 0);
}

/** 失敗時のデフォルト戻り先。allowlist の最初のホスト or `/`。 */
export function defaultLandingFor(env: Env): string {
	const first = parseAllowedOrigins(env.FIRST_PARTY_ORIGINS)[0];
	return first ?? "/";
}
