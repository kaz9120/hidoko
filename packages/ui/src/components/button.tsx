import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "ui/lib/utils";

const variantClass: Record<string, string> = {
	default: "hi-btn--primary",
	outline: "",
	secondary: "",
	destructive: "hi-btn--danger",
	ghost: "hi-btn--ghost",
	link: "hi-link",
};

const sizeClass: Record<string, string> = {
	default: "",
	xs: "hi-btn--sm",
	sm: "hi-btn--sm",
	lg: "hi-btn--lg",
	icon: "hi-btn--icon",
	"icon-xs": "hi-btn--icon hi-btn--sm",
	"icon-sm": "hi-btn--icon",
	"icon-lg": "hi-btn--icon hi-btn--lg",
};

type ButtonVariant = keyof typeof variantClass;
type ButtonSize = keyof typeof sizeClass;

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	asChild?: boolean;
}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(
				variant === "link" ? "hi-link" : "hi-btn",
				variantClass[variant],
				sizeClass[size],
				className,
			)}
			{...props}
		/>
	);
}

export { Button, type ButtonSize, type ButtonVariant };
