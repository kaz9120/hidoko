export function meta() {
	return [
		{ title: "アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

// 認証画面は後続のコミットで足す。今はスケルトンの index ページのみ。
export default function Home() {
	return (
		<main className="min-h-dvh bg-[var(--bg)] p-8 text-[var(--text)]">
			<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
				HIDOKO-ID / SKELETON
			</p>
		</main>
	);
}
