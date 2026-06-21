import type { ReactNode } from "react";
import { cn } from "ui/lib/utils";

/**
 * パネル内のセクション見出し。等幅・極小・字間 0.22em の編集的なタグ。
 * 最初の 1 つには上罫線を出さない。
 */
export function SectionTitle({
	children,
	annotation,
	className,
}: {
	children: ReactNode;
	annotation?: ReactNode;
	className?: string;
}) {
	return (
		<h2
			className={cn(
				"mt-4 mb-2.5 flex items-center gap-2 border-t border-dashed border-border pt-3.5",
				"font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted",
				"first:mt-0 first:border-t-0 first:pt-0",
				className,
			)}
		>
			<span>{children}</span>
			{annotation && <span className="text-[10px]">{annotation}</span>}
		</h2>
	);
}
