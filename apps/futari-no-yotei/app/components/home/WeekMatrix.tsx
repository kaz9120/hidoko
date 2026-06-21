/**
 * 週間ステータス俯瞰グリッド。
 *
 *   行: 各 status_item
 *   列: 月〜日 7 日分
 *   セル: 確定 (鮮明) / 推定 (淡色 + ドット) / 未回答 (中央点)
 *
 * 「LINE で聞き合うより速い」中核 UI。一目で「だれが・どこに・何をして」を
 * 把握できるよう、絵文字ベースで読ませる。色アクセントは「今日」列に限定して
 * 視線を集める。
 */

import type { ApiDayStatus, ApiStatusItem } from "~/lib/api/types";
import {
	dateFromKey,
	getOption,
	resolveDayStatus,
	WEEKDAYS_JP,
} from "~/lib/data/derive";

type Props = {
	items: ApiStatusItem[];
	statuses: ApiDayStatus[];
	dates: string[];
	todayKey: string;
};

export function WeekMatrix({ items, statuses, dates, todayKey }: Props) {
	return (
		<div className="overflow-hidden rounded-lg border border-border bg-bg-raised shadow-card">
			{/* 列ヘッダ (曜日 + 日) */}
			<div
				className="grid border-border-subtle border-b bg-bg-overlay"
				style={{ gridTemplateColumns: `28px repeat(${dates.length}, 1fr)` }}
			>
				<div />
				{dates.map((k) => {
					const d = dateFromKey(k);
					const wkd = d.getDay();
					const isToday = k === todayKey;
					const wkdLabel = WEEKDAYS_JP[wkd];
					// 日曜は rust、土曜は moon、平日は faint。今日のときは accent で上書き。
					const wkColor =
						wkd === 0
							? "text-rust"
							: wkd === 6
								? "text-moon"
								: "text-text-faint";
					return (
						<div
							key={k}
							className="border-border-subtle border-l py-1.5 text-center"
							style={{
								background: isToday
									? "color-mix(in oklab, var(--brand) 10%, transparent)"
									: undefined,
							}}
						>
							<div
								className={`font-mono text-[9px] tracking-[0.18em] ${
									isToday ? "text-brand" : wkColor
								}`}
							>
								{wkdLabel}
							</div>
							<div
								className={`mt-px font-semibold text-[12px] ${
									isToday ? "text-brand" : "text-text-strong"
								}`}
								style={{ fontFeatureSettings: '"tnum"' }}
							>
								{d.getDate()}
							</div>
						</div>
					);
				})}
			</div>
			{/* 各項目の行 */}
			{items.map((item, ri) => (
				<div
					key={item.id}
					className={`grid min-h-[30px] ${ri > 0 ? "border-border-subtle border-t" : ""}`}
					style={{ gridTemplateColumns: `28px repeat(${dates.length}, 1fr)` }}
				>
					<div className="flex items-center justify-center border-border-subtle border-r bg-bg-overlay text-[12px]">
						<span aria-hidden>{item.emoji}</span>
						<span className="sr-only">{item.name}</span>
					</div>
					{dates.map((k) => {
						const st = resolveDayStatus(k, item, statuses);
						const opt = st ? getOption(item, st.optionId) : undefined;
						const isToday = k === todayKey;
						const cellLabel = opt
							? `${item.name} ${k} は ${opt.label}${st && !st.confirmed ? " (推定)" : ""}`
							: `${item.name} ${k} は未回答`;
						return (
							<div
								key={k}
								className="relative flex items-center justify-center border-border-subtle border-l p-0.5"
								style={{
									background: isToday
										? "color-mix(in oklab, var(--brand) 4%, transparent)"
										: undefined,
								}}
							>
								{opt ? (
									<span
										className="text-[14px]"
										style={{
											opacity: st?.confirmed ? 1 : 0.45,
											filter: st?.confirmed ? "none" : "grayscale(0.5)",
										}}
										aria-hidden
									>
										{opt.emoji}
									</span>
								) : (
									<span className="text-[11px] text-text-faint" aria-hidden>
										·
									</span>
								)}
								<span className="sr-only">{cellLabel}</span>
								{opt && !st?.confirmed ? (
									<span
										aria-hidden
										className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-border-strong"
									/>
								) : null}
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}
