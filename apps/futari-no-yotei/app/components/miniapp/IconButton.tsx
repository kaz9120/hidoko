import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	"aria-label": string;
	children: ReactNode;
};

/**
 * ヘッダー内などに置く小さなアイコンボタン。サイズと色は固定。
 * アイコンだけだと意味が伝わらないので `aria-label` 必須にしている。
 */
export function IconButton({
	className = "",
	children,
	type = "button",
	...rest
}: Props) {
	return (
		<button
			type={type}
			className={`flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent p-0 text-text-muted transition-colors hover:text-text-strong focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${className}`}
			{...rest}
		>
			{children}
		</button>
	);
}
