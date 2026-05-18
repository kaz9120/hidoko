export function meta() {
	return [
		{ title: "ふたりのよてい" },
		{
			name: "description",
			content:
				"同居夫婦・カップルのための、LINE ミニアプリ。在宅・弁当・晩御飯を聞かなくても、見ればわかる。",
		},
	];
}

export default function Home() {
	return (
		<main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 py-16 text-center">
			<p className="font-mono text-[10px] text-text-faint uppercase tracking-[0.18em]">
				HUSO · for two
			</p>
			<h1 className="mt-3 font-bold text-4xl text-text-strong tracking-[-0.04em]">
				ふたりのよてい
			</h1>
			<p className="mt-4 text-sm text-text-muted leading-relaxed">
				同居夫婦・カップルのための、LINE ミニアプリ。
				<br />
				在宅、弁当、晩御飯——
				<br />
				聞かなくても、見ればわかる。
			</p>
			<p className="mt-10 font-mono text-[10px] text-text-faint uppercase tracking-[0.18em]">
				PREPARING · 準備中
			</p>
		</main>
	);
}
