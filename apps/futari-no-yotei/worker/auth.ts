/**
 * 認証ミドルウェア。
 *
 * 現状は開発バイパス (`X-Dev-User` ヘッダ) を持っているが、これは
 * `env.ALLOW_DEV_AUTH === "true"` のときのみ受け取る。本番デプロイで
 * 開発ヘッダを偽装されて認証バイパスされるのを防ぐ最終ラインがこの
 * ガードになる。LIFF 認証を本実装するときに、開発バイパスは廃止して
 * `Authorization: Bearer <id_token>` を LINE JWK で検証する経路に
 * 置き換える (後続 PR)。
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
 * 認証ミドルウェア。
 *
 * 受理する条件:
 *   1. `env.ALLOW_DEV_AUTH === "true"` (現状は wrangler.jsonc で常時 true)
 *   2. `X-Dev-User: <users.id>` ヘッダが付いている
 *   3. その user が active な pair に属している
 *
 * 上記いずれかが満たされなければ 401。
 *
 * 本番 LIFF 化時:
 *   - `ALLOW_DEV_AUTH` を `"false"` にする / 削除する
 *   - `Authorization: Bearer <LIFF ID token>` を LINE JWK で検証する経路を
 *     追加する
 */
export const requireAuth: MiddlewareHandler<{ Bindings: Env }> = async (
	c,
	next,
) => {
	const allowDevAuth = c.env.ALLOW_DEV_AUTH === "true";
	const devUser = c.req.header("X-Dev-User");

	if (!allowDevAuth) {
		// 本番モード。LIFF 経路が無いのでまだ何も受理できない。
		return c.json(
			{ error: "authentication not yet implemented for this environment" },
			{ status: 401 },
		);
	}

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
