import type { ComponentPropsWithoutRef } from "react";
import { cn } from "ui/lib/utils";

/**
 * `hi-mark` 相当の小ラベル。JetBrains Mono / 11px / letter-spacing 0.18em /
 * uppercase。デフォルト色は text-faint、ember 色にしたいときは tone="ember"。
 */
export function Mark({
	tone = "muted",
	className,
	children,
	...props
}: ComponentPropsWithoutRef<"span"> & {
	tone?: "muted" | "ember";
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center font-mono text-[11px] uppercase",
				"tracking-[0.18em]",
				tone === "ember" ? "text-[var(--brand)]" : "text-[var(--text-faint)]",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
