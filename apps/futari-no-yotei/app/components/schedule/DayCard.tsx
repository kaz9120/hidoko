import { WhoseChip } from "~/components/couple/WhoseChip";
import { dayStatus, getOption, schedulesOn } from "~/lib/data/helpers";
import { STATUS_ITEMS, WEEKDAYS_JP } from "~/lib/data/sample";

export type DayCardSize = "compact" | "normal" | "large";
export type DayCardVariant = "today" | "normal" | "past";

type Props = {
	/** ISO 形式 YYYY-MM-DD */
	dateKey: string;
	/** 曜日 + 日付の下に出す追加ラベル (例: "今日" "明日") */
	label?: string;
	variant?: DayCardVariant;
	size?: DayCardSize;
	/** ステータス絵文字行を隠す。予定だけ見せたい使い方で true。 */
	hideEmptyStatus?: boolean;
};

/**
 * 統一日カード。左ガターに曜日 + 日付、右にステータス絵文字行 + 予定行。
 *
 * 週ビュー (このカードを縦に 7 枚並べる)、ホームの「今日 / 明日」表示、
 * 日詳細への入口など、複数画面から呼ばれる前提。サイズは compact / normal /
 * large の 3 段階、表示状態は today / normal / past の 3 種を持つ。
 */
export function DayCard({
	dateKey,
	label,
	variant = "normal",
	size = "normal",
	hideEmptyStatus = false,
}: Props) {
	const d = new Date(`${dateKey}T00:00:00`);
	const wkd = d.getDay();
	const schedules = schedulesOn(dateKey);
	const isToday = variant === "today";
	const isPast = variant === "past";

	const sz = SIZES[size];
	const weekdayColor = isToday
		? "var(--brand)"
		: wkd === 0
			? "var(--rust)"
			: wkd === 6
				? "var(--moon)"
				: "var(--text-faint)";

	return (
		<div
			className="flex items-stretch overflow-hidden rounded-lg border"
			style={{
				background: isToday
					? "linear-gradient(180deg, color-mix(in oklab, var(--brand) 7%, var(--bg-raised)) 0%, var(--bg-raised) 100%)"
					: "var(--bg-raised)",
				borderColor: isToday
					? "color-mix(in oklab, var(--brand) 35%, var(--border))"
					: "var(--border-subtle)",
				boxShadow: isToday
					? "var(--glow-ember-soft), var(--shadow-card)"
					: "var(--shadow-card)",
				opacity: isPast ? 0.5 : 1,
			}}
		>
			{/* 左ガター */}
			<div
				className="flex shrink-0 flex-col items-center justify-start border-border-subtle border-r"
				style={{
					width: sz.gut,
					padding: `${sz.padY}px 0`,
					background: isToday ? "transparent" : "var(--bg-overlay)",
					gap: 1,
				}}
			>
				<span
					className="font-mono uppercase tracking-[0.18em]"
					style={{ fontSize: 10, color: weekdayColor }}
				>
					{WEEKDAYS_JP[wkd]}
				</span>
				<span
					className="font-bold tabular-nums leading-none tracking-[-0.02em]"
					style={{
						fontSize: sz.dayFs,
						color: isToday ? "var(--brand)" : "var(--text-strong)",
					}}
				>
					{d.getDate()}
				</span>
				{label ? (
					<span
						className="font-mono uppercase tracking-[0.18em]"
						style={{
							fontSize: 8,
							color: isToday ? "var(--brand)" : "var(--text-faint)",
							marginTop: 4,
						}}
					>
						{label}
					</span>
				) : null}
			</div>

			{/* 右コンテンツ */}
			<div
				className="flex min-w-0 flex-1 flex-col"
				style={{
					padding: `${sz.padY}px ${sz.padX}px`,
					gap: sz.gap,
				}}
			>
				{hideEmptyStatus ? null : (
					<div className="flex flex-wrap gap-1">
						{STATUS_ITEMS.map((item) => {
							const st = dayStatus(dateKey, item.id);
							const opt = st ? getOption(item.id, st.option) : null;
							const itemLabel = `${item.name}: ${opt?.label ?? "未回答"}${
								st && !st.confirmed ? " (推定)" : ""
							}`;
							return (
								<span
									key={item.id}
									title={itemLabel}
									role="img"
									aria-label={itemLabel}
									className="inline-flex items-center justify-center rounded-sm"
									style={{
										width: STATUS_CELL[size],
										height: STATUS_CELL[size],
										background: st?.confirmed
											? "color-mix(in oklab, var(--brand) 12%, transparent)"
											: "transparent",
										border: `1px ${st?.confirmed ? "solid" : "dashed"} ${
											st?.confirmed
												? "color-mix(in oklab, var(--brand) 32%, transparent)"
												: "var(--border)"
										}`,
										fontSize: sz.emojiFs,
										opacity: st?.confirmed ? 1 : 0.55,
									}}
								>
									{opt?.emoji ?? (
										<span
											aria-hidden
											className="text-text-faint"
											style={{ fontSize: 10 }}
										>
											·
										</span>
									)}
								</span>
							);
						})}
					</div>
				)}

				{schedules.length > 0 ? (
					<ul
						className="m-0 flex list-none flex-col gap-1 p-0"
						style={{
							paddingTop: hideEmptyStatus ? 0 : 4,
							borderTop: hideEmptyStatus
								? "none"
								: "1px dashed var(--border-subtle)",
						}}
					>
						{schedules.map((s) => (
							<li
								key={s.id}
								className="flex items-center gap-2"
								style={{ fontSize: sz.schFs }}
							>
								<WhoseChip whose={s.whose} />
								<span
									className="font-mono text-text-faint"
									style={{
										fontSize: sz.schFs - 1,
										minWidth: 36,
									}}
								>
									{s.allDay ? "終日" : s.time}
								</span>
								<span
									className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-text-strong"
									style={{ fontWeight: s.anniversary ? 600 : 400 }}
								>
									{s.title}
								</span>
								{s.fromLine ? (
									<span
										className="rounded-xs border font-mono tracking-[0.18em]"
										style={{
											fontSize: 8,
											padding: "0 4px",
											color: "var(--success)",
											borderColor:
												"color-mix(in oklab, var(--success) 40%, transparent)",
										}}
									>
										LINE
									</span>
								) : null}
							</li>
						))}
					</ul>
				) : null}
			</div>
		</div>
	);
}

const SIZES = {
	compact: {
		padX: 10,
		padY: 8,
		gut: 44,
		dayFs: 18,
		gap: 6,
		emojiFs: 12,
		schFs: 11,
	},
	normal: {
		padX: 12,
		padY: 11,
		gut: 52,
		dayFs: 22,
		gap: 8,
		emojiFs: 13,
		schFs: 12,
	},
	large: {
		padX: 14,
		padY: 14,
		gut: 60,
		dayFs: 32,
		gap: 10,
		emojiFs: 15,
		schFs: 13,
	},
} as const satisfies Record<DayCardSize, Record<string, number>>;

const STATUS_CELL: Record<DayCardSize, number> = {
	compact: 24,
	normal: 28,
	large: 30,
};
