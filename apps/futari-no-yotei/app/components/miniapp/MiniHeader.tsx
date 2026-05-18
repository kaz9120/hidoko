import type { ReactNode } from "react";

export type MiniHeaderProps = {
	title: string;
	subtitle?: string;
	leading?: ReactNode;
	trailing?: ReactNode;
};

/**
 * LINE Mini App 自身のヘッダー（OS の status bar の下に出る帯）。
 * タイトルは中央寄せ、左右の leading / trailing は固定幅で center が
 * 歪まないように切ってある。
 */
export function MiniHeader({
	title,
	subtitle,
	leading,
	trailing,
}: MiniHeaderProps) {
	return (
		<div className="sticky top-0 z-5 flex min-h-[48px] items-center gap-2.5 border-border-subtle border-b bg-bg px-3.5 py-2.5">
			<div className="flex w-7 justify-start">{leading ?? null}</div>
			<div className="min-w-0 flex-1 text-center">
				<div className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-sm text-text-strong tracking-tight">
					{title}
				</div>
				{subtitle ? (
					<div className="mt-px font-mono text-[11px] text-text-faint tracking-[0.04em]">
						{subtitle}
					</div>
				) : null}
			</div>
			<div className="flex w-7 justify-end">{trailing ?? null}</div>
		</div>
	);
}
