/**
 * ホーム最上部、今日の日付 + 曜日 + 未確定バッジ。
 * accent カラーの大きな日付数字で「いま、ここ」を示す視覚アンカー。
 */

import { dateFromKey, WEEKDAYS_JP } from "~/lib/data/derive";

type Props = {
	dateKey: string;
	summary?: string;
	unconfirmedCount: number;
};

export function TodayHeader({ dateKey, summary, unconfirmedCount }: Props) {
	const d = dateFromKey(dateKey);
	return (
		<div className="flex items-end gap-2.5 px-3.5">
			<span
				className="font-bold text-4xl text-brand leading-none tracking-[-0.04em]"
				style={{ fontFeatureSettings: '"tnum"' }}
			>
				{d.getDate()}
			</span>
			<div className="flex-1 pb-1">
				<div className="font-medium text-sm text-text-strong">
					{WEEKDAYS_JP[d.getDay()]}・きょう
				</div>
				{summary ? (
					<div className="mt-0.5 text-[11px] text-text-muted leading-relaxed">
						{summary}
					</div>
				) : null}
			</div>
			{unconfirmedCount > 0 ? (
				// バッジ自体のテキストが「{count} 未確定」で意味を成すので、
				// aria-label は付けない (要素読み上げと aria-label の二重提示を避ける)。
				<span className="mb-1.5 self-end rounded-full border border-brand/40 border-dashed bg-brand-soft px-1.5 py-0.5 font-mono text-[9px] text-brand tracking-[0.18em]">
					{unconfirmedCount} 未確定
				</span>
			) : null}
		</div>
	);
}
