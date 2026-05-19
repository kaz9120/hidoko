import { useEffect } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import { toast } from "sonner";
import { PairMoon } from "~/components/couple/PairMoon";
import { TodayHeader } from "~/components/home/TodayHeader";
import { UnconfirmedPrompt } from "~/components/home/UnconfirmedPrompt";
import { WeekMatrix } from "~/components/home/WeekMatrix";
import { AppShell } from "~/components/layout/AppShell";
import { ApiError, api } from "~/lib/api/client";
import type {
	ApiDayStatus,
	ApiStatusItem,
	PutDayStatusPayload,
} from "~/lib/api/types";
import {
	isoKey,
	resolveDayStatus,
	rollingWeekDateKeys,
} from "~/lib/data/derive";

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

/**
 * 「今日」を返す。本番では `new Date()` だが、テスト / 開発で固定したいときの
 * ために 1 箇所に閉じておく。
 */
function getToday(): Date {
	return new Date();
}

export async function clientLoader() {
	const today = getToday();
	// 今日を左端にした直近 7 日。月曜始まりの暦上の「今週」ではない
	// (週ビューがそちらを担う)。
	const weekKeys = rollingWeekDateKeys(today);
	const from = weekKeys[0];
	const to = weekKeys[weekKeys.length - 1];
	// items と statuses は独立に取れるので並列
	const [items, statuses] = await Promise.all([
		api.statusItems.list(),
		api.dayStatuses.list(from, to),
	]);
	return {
		items,
		statuses,
		todayKey: isoKey(today),
		weekKeys,
	};
}

type ActionOk = { ok: true; item: ApiDayStatus };
type ActionErr = { ok: false; error: string };

export async function clientAction({
	request,
}: {
	request: Request;
}): Promise<ActionOk | ActionErr> {
	try {
		// `request.json()` の失敗 (送信側がボディを壊す稀ケース) も
		// `ActionErr` に包んで UI 側のエラー表示経路に乗せる。
		const body = (await request.json()) as PutDayStatusPayload;
		const item = await api.dayStatuses.put(body);
		return { ok: true, item };
	} catch (e) {
		const message =
			e instanceof ApiError
				? `保存できませんでした (HTTP ${e.status})`
				: "保存できませんでした";
		return { ok: false, error: message };
	}
}

export default function Home() {
	const { items, statuses, todayKey, weekKeys } =
		useLoaderData<typeof clientLoader>();
	const fetcher = useFetcher<typeof clientAction>();
	// `useRevalidator()` の戻り値オブジェクト自体はレンダーごとに新しい参照に
	// なり得るが、`revalidate` 関数は安定しているので分割代入してそれだけを
	// effect の deps に入れる。
	const { revalidate } = useRevalidator();

	// 「自分が決める」項目だけを今日ぶん絞り込む。assignee = "partner" は
	// 後続 PR で「相手に聞く」セクションに振り分ける。
	const todayPrompts = items
		.filter((it) => it.assignee === "me" || it.assignee === "both")
		.map((it) => ({
			item: it,
			current: resolveDayStatus(todayKey, it, statuses),
		}))
		.filter(({ current }) => !current?.confirmed);

	// 今日の未確定数 (自分が決めるぶん) は TodayHeader のバッジに出す。
	const unconfirmedCount = todayPrompts.length;

	// 楽観反映ではなく、fetcher 完了後に revalidate して再取得する素直な戦略。
	// 1 セルあたりの送信負荷は小さい (PUT 1 本) ので、初期はこれで体感問題ない。
	useEffect(() => {
		if (fetcher.state !== "idle" || !fetcher.data) return;
		if (fetcher.data.ok) {
			revalidate();
		} else {
			toast.error(fetcher.data.error);
		}
	}, [fetcher.state, fetcher.data, revalidate]);

	function handlePick(itemId: string, optionId: string) {
		// React Router の fetcher は同一インスタンスへの連続 submit で先行する
		// リクエストを自動キャンセルする。連打 / 画面外で programmatic に呼ばれた
		// ケースでも「押したのに保存されない」を作らないよう、idle のときだけ
		// submit する。UnconfirmedPrompt 側でも disabled しているが、二重防御。
		if (fetcher.state !== "idle") return;
		const payload: PutDayStatusPayload = {
			date: todayKey,
			statusItemId: itemId,
			optionId,
		};
		fetcher.submit(payload, { method: "put", encType: "application/json" });
	}

	// 進行中の確定が「どの (itemId, optionId) を送っているか」を取り出す。
	// fetcher.formData は JSON encType だと埋まらないので fetcher.json を使う。
	const pending =
		fetcher.state !== "idle"
			? (fetcher.json as PutDayStatusPayload | undefined)
			: undefined;

	return (
		<AppShell>
			<main className="px-0 pt-3 pb-24">
				<HomeBrand />
				<HomeMatrix
					items={items}
					statuses={statuses}
					dates={weekKeys}
					todayKey={todayKey}
				/>
				<div className="mt-6">
					<TodayHeader
						dateKey={todayKey}
						summary={buildTodaySummary(items, statuses, todayKey)}
						unconfirmedCount={unconfirmedCount}
					/>
				</div>
				{todayPrompts.length > 0 ? (
					<section className="mt-4 px-3.5">
						<SectionLabel
							tone="accent"
							count={todayPrompts.length}
							label="あなたが決める"
						/>
						<div className="mt-2 flex flex-col gap-2">
							{todayPrompts.map(({ item, current }) => (
								<UnconfirmedPrompt
									key={item.id}
									item={item}
									dateKey={todayKey}
									current={current}
									onPick={(optionId) => handlePick(item.id, optionId)}
									pendingOptionId={
										pending?.statusItemId === item.id
											? pending.optionId
											: undefined
									}
								/>
							))}
						</div>
					</section>
				) : (
					<EmptyDecide />
				)}
			</main>
		</AppShell>
	);
}

function HomeBrand() {
	return (
		<div className="flex items-center gap-2 px-3.5 pt-3 pb-1">
			<PairMoon size={20} />
			<div className="flex-1">
				<div className="font-semibold text-[13px] text-text-strong tracking-tight">
					ふたりのよてい
				</div>
				<div className="mt-px font-mono text-[9px] text-text-faint tracking-[0.18em]">
					HUSO · for two
				</div>
			</div>
		</div>
	);
}

function HomeMatrix({
	items,
	statuses,
	dates,
	todayKey,
}: {
	items: ApiStatusItem[];
	statuses: ApiDayStatus[];
	dates: string[];
	todayKey: string;
}) {
	const range = `${shortDate(dates[0])} — ${shortDate(dates[dates.length - 1])}`;
	return (
		<div className="px-3.5 pt-1">
			<div className="mb-2 flex items-baseline justify-between">
				<span className="font-mono text-[11px] text-text-muted tracking-[0.18em]">
					これから 1しゅうかん
				</span>
				<span className="font-mono text-[10px] text-text-faint">{range}</span>
			</div>
			<WeekMatrix
				items={items}
				statuses={statuses}
				dates={dates}
				todayKey={todayKey}
			/>
		</div>
	);
}

/** "2026-05-18" → "5/18"。WeekMatrix の見出し下部の日付レンジ表示用。 */
function shortDate(dateKey: string): string {
	const [, m, d] = dateKey.split("-");
	return `${Number(m)}/${Number(d)}`;
}

function SectionLabel({
	tone,
	label,
	count,
}: {
	tone: "accent" | "muted";
	label: string;
	count: number;
}) {
	const colorClass = tone === "accent" ? "text-accent" : "text-text-muted";
	return (
		<div
			className={`flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] ${colorClass}`}
		>
			{tone === "accent" ? (
				<span
					aria-hidden
					className="h-1.5 w-1.5 rounded-full bg-accent"
					style={{ boxShadow: "var(--glow-ember-soft)" }}
				/>
			) : null}
			<span>{label}</span>
			<span
				className="text-text-faint"
				style={{ letterSpacing: 0 }}
			>{`· ${count}件`}</span>
		</div>
	);
}

function EmptyDecide() {
	return (
		<div className="mt-4 px-3.5">
			<div className="rounded-md border border-border-subtle bg-bg-overlay px-3 py-4 text-center text-[12px] text-text-muted leading-relaxed">
				今日のぶんはぜんぶ決まっています。
				<br />
				お疲れさまでした。
			</div>
		</div>
	);
}

/**
 * 今日の状況を 1 行で要約する。確定された主要項目から拾う。
 * (例: "ふたりとも出社。晩御飯は未確定")
 *
 * 重い自然言語生成は避け、ヒューリスティクスで「主役」項目だけ拾う初期版。
 */
function buildTodaySummary(
	items: ApiStatusItem[],
	statuses: ApiDayStatus[],
	todayKey: string,
): string | undefined {
	const labels: string[] = [];
	for (const item of items) {
		const st = resolveDayStatus(todayKey, item, statuses);
		if (!st) continue;
		const opt = item.options.find((o) => o.id === st.optionId);
		if (!opt) continue;
		if (st.confirmed) {
			labels.push(`${item.name}: ${opt.label}`);
		}
	}
	if (labels.length === 0) return undefined;
	// 長くなりすぎないよう先頭 3 件まで
	return labels.slice(0, 3).join("・");
}
