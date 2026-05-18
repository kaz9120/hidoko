import { GripVertical, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { toast } from "sonner";
import { AppShell } from "~/components/layout/AppShell";
import {
	StatusItemDialog,
	type StatusItemFormValues,
} from "~/components/settings/StatusItemDialog";
import { ApiError, api } from "~/lib/api/client";
import type {
	ApiStatusItem,
	CreateStatusItemPayload,
	UpdateStatusItemPayload,
} from "~/lib/api/types";
import { ME, PARTNER } from "~/lib/data/sample";
import type { StatusOption, WeekdayKey } from "~/lib/types";

export function meta() {
	return [
		{ title: "ステータス項目 · ふたりのよてい" },
		{
			name: "description",
			content: "家の暮らしに合わせて、ステータス項目を作成・編集する画面です。",
		},
	];
}

export async function clientLoader() {
	const items = await api.statusItems.list();
	return { items };
}

type CreateIntent = {
	intent: "create";
	payload: CreateStatusItemPayload;
};
type UpdateIntent = {
	intent: "update";
	id: string;
	payload: UpdateStatusItemPayload;
};
type DeleteIntent = {
	intent: "delete";
	id: string;
};
type ActionBody = CreateIntent | UpdateIntent | DeleteIntent;

type ActionOk =
	| { ok: true; intent: "create"; item: ApiStatusItem }
	| { ok: true; intent: "update"; item: ApiStatusItem }
	| { ok: true; intent: "delete"; id: string };
type ActionErr = { ok: false; intent: ActionBody["intent"]; error: string };

export async function clientAction({
	request,
}: {
	request: Request;
}): Promise<ActionOk | ActionErr> {
	const body = (await request.json()) as ActionBody;
	try {
		switch (body.intent) {
			case "create": {
				const item = await api.statusItems.create(body.payload);
				return { ok: true, intent: "create", item };
			}
			case "update": {
				const item = await api.statusItems.update(body.id, body.payload);
				return { ok: true, intent: "update", item };
			}
			case "delete": {
				await api.statusItems.remove(body.id);
				return { ok: true, intent: "delete", id: body.id };
			}
		}
	} catch (e) {
		const message =
			e instanceof ApiError
				? `保存できませんでした (HTTP ${e.status})`
				: "保存できませんでした";
		return { ok: false, intent: body.intent, error: message };
	}
}

/** 新規項目の選択肢の初期値。本 PR では「はい / いいえ」の 2 値で固定。 */
const DEFAULT_OPTIONS: StatusOption[] = [
	{ id: "yes", label: "はい", emoji: "✓" },
	{ id: "no", label: "いいえ", emoji: "✕" },
];

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

function assigneeMeta(item: ApiStatusItem): { label: string; tone: string } {
	if (item.assignee === "me")
		return { label: `${ME.name}が決める`, tone: ME.tone };
	if (item.assignee === "partner")
		return { label: `${PARTNER.name}が決める`, tone: PARTNER.tone };
	return { label: "ふたりで", tone: "var(--ink-500)" };
}

function AssigneeBadge({ item }: { item: ApiStatusItem }) {
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

function WeekdayDefaultsRow({ item }: { item: ApiStatusItem }) {
	if (!item.weekdayDefaults) return null;
	const wd = item.weekdayDefaults;
	const summary = WEEKDAY_DISPLAY.map((wk) => {
		const opt = item.options.find((o) => o.id === wd[wk]);
		return `${WEEKDAY_DISPLAY_LABEL[wk]}は${opt?.label ?? "未設定"}。`;
	}).join(" ");
	return (
		<div className="mt-2.5 flex items-center gap-1.5 border-border-subtle border-t border-dashed pt-2">
			<span className="font-mono text-[9px] text-text-faint uppercase tracking-[0.18em]">
				曜日デフォルト
			</span>
			<div className="flex flex-1 gap-px" aria-hidden>
				{WEEKDAY_DISPLAY.map((wk, i) => {
					const opt = item.options.find((o) => o.id === wd[wk]);
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

function ItemCard({
	item,
	onEdit,
}: {
	item: ApiStatusItem;
	onEdit: (item: ApiStatusItem) => void;
}) {
	return (
		<div className="mb-2 rounded-md border border-border-subtle bg-bg-raised p-3">
			<div className="flex items-center gap-2.5">
				<span
					aria-hidden
					className="cursor-grab px-px text-text-faint"
					title="ドラッグして並び替え（後続 PR）"
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
					onClick={() => onEdit(item)}
					className="inline-flex cursor-pointer items-center gap-1 rounded-sm border border-border-subtle bg-bg-overlay px-2 py-0.5 font-mono text-[10px] text-text-muted transition-colors hover:text-text-strong"
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

type DialogState =
	| { mode: "create" }
	| { mode: "edit"; item: ApiStatusItem }
	| null;

export default function SettingsStatusItems() {
	const { items } = useLoaderData<typeof clientLoader>();
	const fetcher = useFetcher<typeof clientAction>();
	const [dialogState, setDialogState] = useState<DialogState>(null);

	const submitting = fetcher.state !== "idle";
	// JSON encType の場合 `fetcher.formData` は埋まらないので `fetcher.json` 経由で
	// 進行中の intent を読む。
	const inflight = fetcher.json as ActionBody | undefined;
	const submittingForm =
		submitting &&
		(inflight?.intent === "create" || inflight?.intent === "update");
	const deleting = submitting && inflight?.intent === "delete";

	useEffect(() => {
		if (fetcher.state !== "idle" || !fetcher.data) return;
		const result = fetcher.data;
		if (result.ok) {
			if (result.intent === "create") {
				toast.success(`「${result.item.name}」を追加しました`);
				setDialogState(null);
			} else if (result.intent === "update") {
				toast.success(`「${result.item.name}」を保存しました`);
				setDialogState(null);
			} else if (result.intent === "delete") {
				toast.success("項目を削除しました");
				setDialogState(null);
			}
		} else {
			toast.error(result.error);
		}
	}, [fetcher.state, fetcher.data]);

	function submitIntent(body: ActionBody) {
		fetcher.submit(body, { method: "post", encType: "application/json" });
	}

	function handleCreate(values: StatusItemFormValues) {
		submitIntent({
			intent: "create",
			payload: { ...values, options: DEFAULT_OPTIONS },
		});
	}

	function handleUpdate(id: string, values: StatusItemFormValues) {
		submitIntent({
			intent: "update",
			id,
			payload: values,
		});
	}

	function handleDelete(id: string) {
		submitIntent({ intent: "delete", id });
	}

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
					{items.map((item) => (
						<li key={item.id}>
							<ItemCard
								item={item}
								onEdit={(it) => setDialogState({ mode: "edit", item: it })}
							/>
						</li>
					))}
				</ul>

				<button
					type="button"
					onClick={() => setDialogState({ mode: "create" })}
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
						子育て / ペット / シフト勤務 / 家事分担 — 後続 PR
						で雛形を選択できるようにします
					</div>
				</aside>
			</main>

			{dialogState?.mode === "create" ? (
				<StatusItemDialog
					mode="create"
					open
					onOpenChange={(v) => {
						if (!v) setDialogState(null);
					}}
					onSubmit={handleCreate}
					submitting={submittingForm}
				/>
			) : null}
			{dialogState?.mode === "edit" ? (
				<StatusItemDialog
					mode="edit"
					open
					onOpenChange={(v) => {
						if (!v) setDialogState(null);
					}}
					initial={{
						id: dialogState.item.id,
						name: dialogState.item.name,
						emoji: dialogState.item.emoji,
						assignee: dialogState.item.assignee,
					}}
					onSubmit={(values) => handleUpdate(dialogState.item.id, values)}
					onDelete={() => handleDelete(dialogState.item.id)}
					submitting={submittingForm}
					deleting={deleting}
				/>
			) : null}
		</AppShell>
	);
}
