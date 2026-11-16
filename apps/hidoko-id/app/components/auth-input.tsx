import type { ReactNode } from "react";
import { Input, type InputProps } from "takibi-design-system";

interface AuthFieldProps {
	label: string;
	htmlFor: string;
	rightLabel?: ReactNode;
	hint?: ReactNode;
	error?: string | null;
	children: ReactNode;
}

/**
 * label + 入力 + small ヘルプ + error の縦配置。
 * 入力欄は `AuthInput`（Takibi の `Input`）を子に置く。
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
				className="flex items-baseline justify-between font-medium text-fg-muted text-sm"
			>
				<span>{label}</span>
				{rightLabel}
			</label>
			{children}
			{error ? (
				<small className="text-danger text-xs">{error}</small>
			) : hint ? (
				<small className="text-fg-subtle text-xs">{hint}</small>
			) : null}
		</div>
	);
}

interface AuthInputProps extends Omit<InputProps, "size"> {
	hasError?: boolean;
}

/**
 * Takibi の `<Input>` を大きいサイズで使う薄いラッパ。
 * `hasError` を `aria-invalid` に渡し、枠を danger の色にする。
 */
export function AuthInput({ hasError, ...props }: AuthInputProps) {
	return <Input size="lg" aria-invalid={hasError || undefined} {...props} />;
}
