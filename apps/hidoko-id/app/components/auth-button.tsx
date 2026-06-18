import { forwardRef } from "react";
import { Button } from "ui/components/button";
import { cn } from "ui/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface AuthButtonProps extends Omit<React.ComponentProps<"button">, "size"> {
	variant?: Variant;
	size?: Size;
}

/**
 * packages/ui の `<Button>` を design の hidoko-id 用に整える薄いラッパ。
 * primary だけ ember グラデーションの CTA。secondary / ghost は ui の標準スタイルに任せる。
 */
export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
	function AuthButton(
		{ className, variant = "secondary", size = "md", children, ...props },
		ref,
	) {
		const uiVariant =
			variant === "primary"
				? "default"
				: variant === "ghost"
					? "ghost"
					: "outline";
		const uiSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "default";

		return (
			<Button
				ref={ref}
				variant={uiVariant}
				size={uiSize}
				className={cn(
					size === "lg" && "h-12 px-6 text-base",
					variant === "primary" && [
						"border border-[var(--ember-600)] text-[#1a0d05]",
						"bg-[linear-gradient(180deg,var(--accent-hover)_0%,var(--accent-active)_100%)]",
						"shadow-[0_1px_0_rgba(0,0,0,0.4),0_6px_20px_rgba(244,125,58,0.35),inset_0_1px_0_rgba(255,240,220,0.35)]",
						"hover:border-[var(--accent-active)]",
						"hover:bg-[linear-gradient(180deg,var(--ember-200)_0%,var(--accent)_100%)]",
						"focus-visible:shadow-[var(--glow-ember-strong)] focus-visible:ring-0",
					],
					variant === "secondary" && [
						"border-[var(--border-strong)] bg-[var(--bg-overlay)] text-[var(--text)]",
						"hover:border-[color-mix(in_oklab,var(--accent)_32%,var(--border-strong))]",
						"hover:bg-[var(--border)] hover:text-[var(--text-strong)]",
						"focus-visible:shadow-[var(--glow-ember)] focus-visible:ring-0",
					],
					variant === "ghost" && [
						"text-[var(--text-muted)]",
						"hover:bg-[var(--bg-overlay)] hover:text-[var(--text-strong)]",
					],
					className,
				)}
				{...props}
			>
				{children}
			</Button>
		);
	},
);
