import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "~/components/layout/AppShell";
import { DayCard, type DayCardVariant } from "~/components/schedule/DayCard";
import { addDays, isoKey, startOfWeek } from "~/lib/data/helpers";
import { TODAY } from "~/lib/data/sample";

export function meta() {
	return [
		{ title: "今週 · ふたりのよてい" },
		{
			name: "description",
			content:
				"夫婦の今週のステータスと予定を、日カードを縦に並べて俯瞰します。",
		},
	];
}

/** ISO 週番号 (月曜始まり)。プロトタイプの "WEEK 21" 表示用。 */
function isoWeek(d: Date): number {
	const target = new Date(d);
	const dayNr = (d.getDay() + 6) % 7;
	target.setDate(target.getDate() - dayNr + 3);
	const firstThursday = new Date(target.getFullYear(), 0, 4);
	const diff = target.getTime() - firstThursday.getTime();
	return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

/** 月の第何週か (月初を含む週を第1週)。 */
function nthWeekOfMonth(d: Date): number {
	const first = new Date(d.getFullYear(), d.getMonth(), 1);
	const offset = first.getDay() === 0 ? 6 : first.getDay() - 1; // 月曜始まりに合わせる
	return Math.floor((d.getDate() + offset - 1) / 7) + 1;
}

/**
 * 週ビュー。サンプルデータの「今日」(2026-05-18) を含む週を表示する。
 * 週ナビ (prev / next) は PR 5 以降で本実装するため、本 PR では視覚のみ。
 */
export default function Week() {
	const todayKey = isoKey(TODAY);
	const start = startOfWeek(TODAY);
	const days = Array.from({ length: 7 }, (_, i) => isoKey(addDays(start, i)));
	const weekNo = isoWeek(start);
	const monthWeek = nthWeekOfMonth(start);

	return (
		<AppShell>
			<main className="px-3.5 pt-6 pb-20">
				<header className="mb-3">
					<h1 className="font-semibold text-text-strong text-xl tracking-tight">
						今週
					</h1>
					<p className="mt-0.5 font-mono text-[10px] text-text-faint tracking-[0.18em] uppercase">
						{`${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, "0")} · WEEK ${weekNo}`}
					</p>
				</header>

				{/* 週送りは本実装が後続 PR のため aria-disabled で SR に伝え、視覚的にも
				    弱める。実装後に aria-disabled とスタイルを外して active 化する。 */}
				<nav aria-label="週ナビゲーション" className="mb-3.5 flex items-center">
					<button
						type="button"
						aria-label="先週へ"
						aria-disabled="true"
						className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-md border-0 bg-transparent text-text-faint opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
					>
						<ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
					</button>
					<div className="flex-1 text-center">
						<div className="font-semibold text-sm text-text-strong">
							{`${start.getFullYear()}年 ${start.getMonth() + 1}月 第${monthWeek}週`}
						</div>
						<div className="font-mono text-[10px] text-text-faint tracking-wide">
							{`${start.getMonth() + 1}/${start.getDate()} 〜 ${addDays(start, 6).getMonth() + 1}/${addDays(start, 6).getDate()}`}
						</div>
					</div>
					<button
						type="button"
						aria-label="来週へ"
						aria-disabled="true"
						className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-md border-0 bg-transparent text-text-faint opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
					>
						<ChevronRight size={16} strokeWidth={1.75} aria-hidden />
					</button>
				</nav>

				<ul className="flex list-none flex-col gap-2 p-0">
					{days.map((k) => {
						const variant: DayCardVariant =
							k === todayKey ? "today" : k < todayKey ? "past" : "normal";
						return (
							<li key={k}>
								<DayCard dateKey={k} variant={variant} />
							</li>
						);
					})}
				</ul>
			</main>
		</AppShell>
	);
}
