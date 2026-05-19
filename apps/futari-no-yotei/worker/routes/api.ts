/**
 * `/api/*` のルーター。認証必須。pair_id は認証コンテキストから取り、
 * クエリやボディには載せない (常に自動スコープ)。
 */

import { Hono } from "hono";
import { requireAuth } from "../auth";
import { dayStatusesRoute } from "./day-statuses";
import { statusItemsRoute } from "./status-items";

export const apiRouter = new Hono<{ Bindings: Env }>();

apiRouter.use("*", requireAuth);

apiRouter.get("/me", (c) => {
	const { userId, pairId } = c.get("auth");
	return c.json({ userId, pairId });
});

apiRouter.route("/status-items", statusItemsRoute);
apiRouter.route("/day-statuses", dayStatusesRoute);
