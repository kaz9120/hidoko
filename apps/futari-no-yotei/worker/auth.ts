/**
 * 認証ミドルウェア。
 *
 * 現状は開発バイパス (`X-Dev-User` ヘッダ) のみ。本番では LIFF ID トークンを
 * LINE JWK で検証する処理に差し替える (後続 PR)。
 */

import type { Context, MiddlewareHandler } from "hono";

export type AuthContext = {
	userId: string;
	pairId: string;
};

declare module "hono" {
	interface ContextVariableMap {
		auth: AuthContext;
	}
}

/**
 * 認証ミドルウェア。`X-Dev-User: <users.id>` を読んで、その user が属する
 * アクティブなペアを解決する。pair が無い場合 401。
 *
 * 本番では `Authorization: Bearer <id_token>` を検証する経路を追加する。
 */
export const requireAuth: MiddlewareHandler<{ Bindings: Env }> = async (
	c,
	next,
) => {
	const devUser = c.req.header("X-Dev-User");
	if (!devUser) {
		return c.json({ error: "authentication required" }, { status: 401 });
	}

	const pair = await c.env.DB.prepare(
		`SELECT id FROM pairs
		   WHERE status = 'active'
		     AND (user_low_id = ?1 OR user_high_id = ?1)
		   LIMIT 1`,
	)
		.bind(devUser)
		.first<{ id: string }>();

	if (!pair) {
		return c.json({ error: "no active pair for this user" }, { status: 401 });
	}

	c.set("auth", { userId: devUser, pairId: pair.id });
	await next();
};

export function getAuth(c: Context): AuthContext {
	const auth = c.get("auth");
	if (!auth) {
		throw new Error("auth context missing — did you forget requireAuth?");
	}
	return auth as AuthContext;
}
