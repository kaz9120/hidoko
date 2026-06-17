import {
	clearSessionCookie,
	destroySession,
	readSessionToken,
} from "../session";
import type { Env } from "../types";
import { jsonError, jsonOk } from "./helpers";

export async function handleSignout(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.method !== "POST") {
		return jsonError(405, "method not allowed");
	}

	const token = readSessionToken(request);
	await destroySession(env, token);
	return jsonOk({}, { headers: { "Set-Cookie": clearSessionCookie(env) } });
}
