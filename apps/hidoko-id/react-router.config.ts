import type { Config } from "@react-router/dev/config";

export default {
	// SPA モード。サーバー側ロジック（D1 / KV / セッション）は workers/app.ts が担う。
	ssr: false,
} satisfies Config;
