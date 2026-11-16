import { Button, type ButtonProps } from "takibi-design-system";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface AuthButtonProps extends Omit<ButtonProps, "variant" | "size"> {
	variant?: Variant;
	size?: Size;
}

/**
 * Takibi の `<Button>` を hidoko-id の既定（secondary / md）で使う薄いラッパ。
 * 見た目は Takibi の variant に任せ、画面ごとの調整は className で渡す。
 */
export function AuthButton({
	variant = "secondary",
	size = "md",
	...props
}: AuthButtonProps) {
	return <Button variant={variant} size={size} {...props} />;
}
