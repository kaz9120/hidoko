// hidoko-id の Worker エントリ（骨組み）。
// 認証ハンドラは後続のコミットで追加する。今は静的アセットへフォールスルーするだけ。

import type { Env } from "./types";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;
