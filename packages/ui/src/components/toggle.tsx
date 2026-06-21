"use client";

import { Toggle as TogglePrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "ui/lib/utils";

type ToggleVariant = "default" | "outline";
type ToggleSize = "default" | "sm" | "lg";

const sizeClass: Record<ToggleSize, string> = {
	default: "h-9 min-w-9 px-2",
	sm: "h-8 min-w-8 px-1.5",
	lg: "h-10 min-w-10 px-2.5",
};

function Toggle({
	className,
	variant = "default",
	size = "default",
	...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & {
	variant?: ToggleVariant;
	size?: ToggleSize;
}) {
	return (
		<TogglePrimitive.Root
			data-slot="toggle"
			className={cn(
				"hi-btn",
				variant === "outline" && "hi-btn--outline",
				sizeClass[size],
				"data-[state=on]:bg-accent data-[state=on]:text-text-on-ember data-[state=on]:border-accent",
				className,
			)}
			{...props}
		/>
	);
}

export { Toggle, type ToggleSize, type ToggleVariant };
