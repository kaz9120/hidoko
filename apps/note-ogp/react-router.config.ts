import type { Config } from "@react-router/dev/config";

export default {
	ssr: false,
	// OGP クローラーは JS を実行しないので、meta タグを静的 HTML に焼き込む。
	// homepage と同じ構成（SPA mode + ルートだけ prerender）。
	prerender: ["/"],
} satisfies Config;
