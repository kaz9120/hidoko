import { forwardRef, type ReactNode } from "react";
import { Input } from "ui/components/input";
import { cn } from "ui/lib/utils";

interface AuthFieldProps {
	label: string;
	htmlFor: string;
	rightLabel?: ReactNode;
	hint?: ReactNode;
	error?: string | null;
	children: ReactNode;
}

/**
 * design の `hi-field` 相当。label + 入力 + small ヘルプ + error の縦配置。
 * packages/ui の `Input` をそのまま使い、見た目調整は `AuthInput` で行う。
 */
export function AuthField({
	label,
	htmlFor,
	rightLabel,
	hint,
	error,
	children,
}: AuthFieldProps) {
	return (
		<div className="flex flex-col gap-1.5">
			<label
				htmlFor={htmlFor}
				className="flex items-baseline justify-between font-medium text-[var(--text-muted)] text-sm"
			>
				<span>{label}</span>
				{rightLabel}
			</label>
			{children}
			{error ? (
				<small className="text-[var(--danger)] text-xs">{error}</small>
			) : hint ? (
				<small className="text-[var(--text-faint)] text-xs">{hint}</small>
			) : null}
		</div>
	);
}

interface AuthInputProps extends React.ComponentProps<"input"> {
	hasError?: boolean;
}

/**
 * packages/ui の `<Input>` を design の hidoko-id 用に整える薄いラッパ。
 * 背景・パディング・ember フォーカスだけ上書きし、focus-visible / aria-invalid の
 * 既定挙動は ui 側に任せる（shadcn 同期で改善が降りてくる）。
 */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
	function AuthInput({ className, hasError, ...props }, ref) {
		return (
			<Input
				ref={ref}
				aria-invalid={hasError || undefined}
				className={cn(
					"h-11 rounded-md bg-[var(--bg-sunken)] px-3.5 text-[15px]",
					"border-[var(--border)] hover:border-[var(--border-strong)]",
					"shadow-[inset_0_1px_0_rgba(0,0,0,0.3)]",
					"focus-visible:border-[var(--accent)]",
					"focus-visible:shadow-[var(--glow-ember),inset_0_1px_0_rgba(0,0,0,0.3)] focus-visible:ring-0",
					hasError && [
						"border-[var(--danger)]",
						"focus-visible:border-[var(--danger)]",
						"focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--danger)_25%,transparent),inset_0_1px_0_rgba(0,0,0,0.3)]",
					],
					className,
				)}
				{...props}
			/>
		);
	},
);
