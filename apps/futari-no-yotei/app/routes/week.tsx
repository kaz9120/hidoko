import { AppShell } from "~/components/layout/AppShell";

export function meta() {
	return [
		{ title: "今週 · ふたりのよてい" },
		{
			name: "description",
			content: "週ビュー（PR 3 で本実装予定の準備中ページです）。",
		},
	];
}

/**
 * 週ビューの本実装は後続 PR で行う。本ファイルは下タブから踏まれたときに
 * 404 に飛ばさないための placeholder。
 */
export default function WeekPlaceholder() {
	return (
		<AppShell>
			<main className="flex min-h-[78dvh] flex-col items-center justify-center px-5 py-16 text-center">
				<p className="font-mono text-[10px] text-text-faint uppercase tracking-[0.18em]">
					COMING SOON
				</p>
				<h1 className="mt-3 font-semibold text-text-strong text-xl tracking-tight">
					週ビュー
				</h1>
				<p className="mt-3 text-sm text-text-muted leading-relaxed">
					次の PR で週カードと予定表示を載せます。
				</p>
			</main>
		</AppShell>
	);
}
