import { type ComponentType, useEffect, useState } from "react";

// Agentation 公式の例は `process.env.NODE_ENV` でガードするが、ここでは
// 「カスタムドメイン本番では出さない / workers.dev と localhost では出す」を
// 要件にしているので、host 名で判定する。workers.dev 側は Cloudflare Access
// で第三者を弾く前提。
const DEBUG_HOST_PATTERN = /\.workers\.dev$|^localhost$|^127\.0\.0\.1$/;

export function AgentationDebugGate() {
	const [Component, setComponent] = useState<ComponentType | null>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!DEBUG_HOST_PATTERN.test(window.location.hostname)) return;
		let cancelled = false;
		import("agentation").then((mod) => {
			if (!cancelled) setComponent(() => mod.Agentation);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	if (!Component) return null;
	return <Component />;
}
