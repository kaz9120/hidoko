import type { ReactNode } from "react";

/**
 * design の `または` 区切り。両側に細い線、中央に mono 11px のラベル。
 */
export function Divider({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-center gap-3.5">
			<div className="h-px flex-1 bg-[var(--border)]" />
			<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
				{children}
			</span>
			<div className="h-px flex-1 bg-[var(--border)]" />
		</div>
	);
}
