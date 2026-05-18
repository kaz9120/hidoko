import { GripVertical, Pencil, Plus } from "lucide-react";
import { AppShell } from "~/components/layout/AppShell";
import { ME, PARTNER, STATUS_ITEMS } from "~/lib/data/sample";
import type { StatusItem, WeekdayKey } from "~/lib/types";

export function meta() {
	return [
		{ title: "ステータス項目 · ふたりのよてい" },
		{
			name: "description",
			content: "家の暮らしに合わせて、ステータス項目を作成・編集する画面です。",
		},
	];
}

/** 月→日の並びで weekdayDefaults を表示するためのキー順。 */
const WEEKDAY_DISPLAY: WeekdayKey[] = [
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat",
	"sun",
];

const WEEKDAY_DISPLAY_LABEL: Record<WeekdayKey, string> = {
	mon: "月",
	tue: "火",
	wed: "水",
	thu: "木",
	fri: "金",
	sat: "土",
	sun: "日",
};

function assigneeMeta(item: StatusItem): { label: string; tone: string } {
	if (item.assignee === "me")
		return { label: `${ME.name}が決める`, tone: ME.tone };
	if (item.assignee === "partner")
		return { label: `${PARTNER.name}が決める`, tone: PARTNER.tone };
	return { label: "ふたりで", tone: "var(--ink-500)" };
}

function AssigneeBadge({ item }: { item: StatusItem }) {
	const { label, tone } = assigneeMeta(item);
	return (
		<span
			className="rounded-sm border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.18em]"
			style={{
				color: tone,
				background: `color-mix(in oklab, ${tone} 14%, var(--bg-overlay))`,
				borderColor: `color-mix(in oklab, ${tone} 30%, transparent)`,
			}}
		>
			{label}
		</span>
	);
}

function OptionChip({ emoji, label }: { emoji: string; label: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-sm border border-border-subtle bg-bg-overlay px-1.5 py-0.5 text-[10px] text-text-muted">
			<span className="text-[11px]">{emoji}</span>
			<span>{label}</span>
		</span>
	);
}

function WeekdayDefaultsRow({ item }: { item: StatusItem }) {
	if (!item.weekdayDefaults) return null;
	const summary = WEEKDAY_DISPLAY.map((wk) => {
		const opt = item.options.find((o) => o.id === item.weekdayDefaults?.[wk]);
		return `${WEEKDAY_DISPLAY_LABEL[wk]}は${opt?.label ?? "未設定"}。`;
	}).join(" ");
	return (
		<div className="mt-2.5 flex items-center gap-1.5 border-border-subtle border-t border-dashed pt-2">
			<span className="font-mono text-[9px] text-text-faint uppercase tracking-[0.18em]">
				曜日デフォルト
			</span>
			<div className="flex flex-1 gap-px" aria-hidden>
				{WEEKDAY_DISPLAY.map((wk, i) => {
					const opt = item.options.find(
						(o) => o.id === item.weekdayDefaults?.[wk],
					);
					return (
						<div
							key={wk}
							className="flex-1 bg-bg-overlay px-px py-0.5 text-center"
							style={{
								borderTopLeftRadius: i === 0 ? "2px" : 0,
								borderBottomLeftRadius: i === 0 ? "2px" : 0,
								borderTopRightRadius: i === 6 ? "2px" : 0,
								borderBottomRightRadius: i === 6 ? "2px" : 0,
							}}
						>
							<div className="font-mono text-[8px] text-text-faint">
								{WEEKDAY_DISPLAY_LABEL[wk]}
							</div>
							<div className="text-[11px]">{opt?.emoji ?? "·"}</div>
						</div>
					);
				})}
			</div>
			<span className="sr-only">{summary}</span>
		</div>
	);
}

function ItemCard({ item }: { item: StatusItem }) {
	return (
		<div className="mb-2 rounded-md border border-border-subtle bg-bg-raised p-3">
			<div className="flex items-center gap-2.5">
				<span
					aria-hidden
					className="cursor-grab px-px text-text-faint"
					title="ドラッグして並び替え（未実装）"
				>
					<GripVertical size={14} strokeWidth={1.75} />
				</span>
				<span aria-hidden className="text-lg">
					{item.emoji}
				</span>
				<span className="flex-1 font-medium text-sm text-text-strong">
					{item.name}
				</span>
				<AssigneeBadge item={item} />
				<button
					type="button"
					aria-label={`${item.name} を編集`}
					className="inline-flex items-center gap-1 rounded-sm border border-border-subtle bg-bg-overlay px-2 py-0.5 font-mono text-[10px] text-text-muted transition-colors hover:text-text-strong"
				>
					<Pencil size={10} strokeWidth={1.75} aria-hidden />
					編集
				</button>
			</div>
			<div className="mt-2 flex flex-wrap gap-1">
				{item.options.map((o) => (
					<OptionChip key={o.id} emoji={o.emoji} label={o.label} />
				))}
			</div>
			<WeekdayDefaultsRow item={item} />
		</div>
	);
}

export default function SettingsStatusItems() {
	return (
		<AppShell>
			<main className="px-3.5 pt-6 pb-20">
				<header className="mb-4">
					<h1 className="font-semibold text-text-strong text-xl tracking-tight">
						ステータス項目
					</h1>
					<p className="mt-1.5 text-text-muted text-xs leading-relaxed">
						家の暮らしに合わせて、項目を作ります。
						<br />
						誰の項目かは、選択肢のラベルで表します。
					</p>
				</header>

				<ul className="list-none p-0">
					{STATUS_ITEMS.map((item) => (
						<li key={item.id}>
							<ItemCard item={item} />
						</li>
					))}
				</ul>

				<button
					type="button"
					className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border-strong border-dashed bg-transparent p-3.5 text-sm text-text-muted transition-colors hover:text-text-strong"
				>
					<Plus size={14} strokeWidth={1.75} aria-hidden />
					項目を追加
				</button>

				<aside className="mt-4 rounded-md bg-bg-overlay p-3 text-text-muted text-xs leading-relaxed">
					<div className="mb-1 font-mono text-[10px] text-text-faint uppercase tracking-[0.18em]">
						テンプレ
					</div>
					<div>
						子育て / ペット / シフト勤務 / 家事分担 — タップで雛形を読み込み
					</div>
				</aside>
			</main>
		</AppShell>
	);
}
