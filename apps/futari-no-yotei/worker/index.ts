/**
 * Cloudflare Worker エントリ。
 *
 * - `/api/*` を Hono で受けて D1 にアクセスする
 * - `/webhook/*` は LINE Messaging API のフック用 (後続 PR で実装)
 * - それ以外は env.ASSETS にフォールバックし、React Router の SPA を返す
 *
 * 認証は `/api/*` のミドルウェアで:
 *   1. 開発: `X-Dev-User` ヘッダで users.id を直接指定 (LIFF 接続前)
 *   2. 本番: `Authorization: Bearer <LIFF ID token>` を LINE JWK で検証 (後続 PR)
 */

import { Hono } from "hono";
import { apiRouter } from "./routes/api";

const app = new Hono<{ Bindings: Env }>();

app.route("/api", apiRouter);

// SPA assets フォールバック
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
