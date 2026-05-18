/**
 * 未確定 → 確定 への最短アクション。
 *
 * 1 つの項目について option ボタンを横並びにし、タップで即確定 (PUT)。
 * 推定値がある場合は selected として表示しておくことで、「いつも通り」を
 * 1 タップで確定できる導線にする。
 *
 * `assignee === "partner"` の項目は本 PR では扱わない (後続の「相手に聞く」
 * セクションで LINE push 経由になる)。呼び出し側で振り分け済みの前提。
 */

import type { ApiStatusItem } from "~/lib/api/types";
import {
	dateFromKey,
	getOption,
	type ResolvedStatus,
	WEEKDAYS_JP,
} from "~/lib/data/derive";

type Props = {
	item: ApiStatusItem;
	dateKey: string;
	/** 推定値 / 確定値。null なら weekdayDefaults も無いケース */
	current: ResolvedStatus | null;
	/** option を選んで確定する */
	onPick: (optionId: string) => void;
	/** 進行中の optionId。送信中はボタンを disabled にしてダブルタップを防ぐ */
	pendingOptionId?: string;
};

export function UnconfirmedPrompt({
	item,
	dateKey,
	current,
	onPick,
	pendingOptionId,
}: Props) {
	const currentOption = current ? getOption(item, current.optionId) : undefined;
	const wkdLabel = WEEKDAYS_JP[dateFromKey(dateKey).getDay()];
	const submitting = pendingOptionId !== undefined;

	// 晩御飯だけは「今夜どうする?」の自然なフレーズを使う。それ以外は項目名そのまま。
	const promptHeadline =
		item.name === "晩御飯" ? "今夜どうする?" : `${item.name}はどうする?`;

	return (
		<div className="rounded-md border border-accent/35 border-dashed bg-bg-raised p-3">
			<div className="mb-1 flex items-center gap-1.5">
				<span aria-hidden className="text-sm">
					{item.emoji}
				</span>
				<span className="font-medium text-[13px] text-text-strong">
					{promptHeadline}
				</span>
			</div>
			{currentOption ? (
				<div className="mb-2.5 text-[10px] text-text-faint">
					{wkdLabel}は ふだん「{currentOption.label}」
				</div>
			) : (
				<div className="mb-2.5 text-[10px] text-text-faint">
					今日のぶんを決める
				</div>
			)}
			<fieldset className="flex gap-1 border-0 p-0">
				<legend className="sr-only">{item.name}</legend>
				{item.options.map((o) => {
					const selected = current?.optionId === o.id;
					const pending = pendingOptionId === o.id;
					return (
						<button
							key={o.id}
							type="button"
							onClick={() => {
								if (submitting) return;
								onPick(o.id);
							}}
							disabled={submitting && !pending}
							aria-pressed={selected}
							aria-busy={pending}
							className="flex flex-1 flex-col items-center gap-0.5 rounded-sm border bg-bg-overlay px-0.5 py-2 text-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
							style={{
								borderColor: selected
									? "color-mix(in oklab, var(--accent) 35%, transparent)"
									: "var(--border-subtle)",
								background: selected
									? "color-mix(in oklab, var(--accent) 14%, var(--bg-overlay))"
									: "var(--bg-overlay)",
								color: selected ? "var(--accent)" : "var(--text-muted)",
								fontWeight: selected ? 600 : 400,
								boxShadow: selected ? "var(--glow-ember-soft)" : "none",
								lineHeight: 1.2,
							}}
						>
							<span
								aria-hidden
								className="text-base"
								style={{ opacity: selected ? 1 : 0.6 }}
							>
								{o.emoji}
							</span>
							<span>{o.label}</span>
						</button>
					);
				})}
			</fieldset>
		</div>
	);
}
