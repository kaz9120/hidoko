import {
	clearSessionCookie,
	destroySession,
	readSessionToken,
} from "../session";
import type { Env } from "../types";
import { jsonOk } from "./helpers";

export async function handleSignout(
	request: Request,
	env: Env,
): Promise<Response> {
	const token = readSessionToken(request);
	await destroySession(env, token);
	return jsonOk({}, { headers: { "Set-Cookie": clearSessionCookie(env) } });
}
