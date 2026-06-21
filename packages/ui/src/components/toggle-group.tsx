"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import * as React from "react";
import type { ToggleSize, ToggleVariant } from "ui/components/toggle";
import { cn } from "ui/lib/utils";

const ToggleGroupContext = React.createContext<{
	variant?: ToggleVariant;
	size?: ToggleSize;
	spacing?: number;
}>({
	size: "default",
	variant: "default",
	spacing: 0,
});

const sizeClass: Record<string, string> = {
	default: "h-9 min-w-9 px-2",
	sm: "h-8 min-w-8 px-1.5",
	lg: "h-10 min-w-10 px-2.5",
};

function ToggleGroup({
	className,
	variant = "default",
	size = "default",
	spacing = 0,
	children,
	...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & {
	variant?: ToggleVariant;
	size?: ToggleSize;
	spacing?: number;
}) {
	return (
		<ToggleGroupPrimitive.Root
			data-slot="toggle-group"
			data-variant={variant}
			data-size={size}
			data-spacing={spacing}
			className={cn(
				"flex w-fit items-center rounded-md",
				spacing === 0 ? "gap-0" : `gap-${spacing}`,
				className,
			)}
			{...props}
		>
			<ToggleGroupContext.Provider value={{ variant, size, spacing }}>
				{children}
			</ToggleGroupContext.Provider>
		</ToggleGroupPrimitive.Root>
	);
}

function ToggleGroupItem({
	className,
	children,
	variant,
	size,
	...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & {
	variant?: ToggleVariant;
	size?: ToggleSize;
}) {
	const context = React.useContext(ToggleGroupContext);
	const resolvedVariant = context.variant || variant || "default";
	const resolvedSize = context.size || size || "default";

	return (
		<ToggleGroupPrimitive.Item
			data-slot="toggle-group-item"
			data-variant={resolvedVariant}
			data-size={resolvedSize}
			data-spacing={context.spacing}
			className={cn(
				"hi-btn",
				resolvedVariant === "outline" && "hi-btn--outline",
				sizeClass[resolvedSize],
				"w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
				"data-[state=on]:bg-accent data-[state=on]:text-text-on-ember data-[state=on]:border-accent",
				"data-[spacing='0']:rounded-none data-[spacing='0']:shadow-none data-[spacing='0']:first:rounded-l-md data-[spacing='0']:last:rounded-r-md",
				className,
			)}
			{...props}
		>
			{children}
		</ToggleGroupPrimitive.Item>
	);
}

export { ToggleGroup, ToggleGroupItem };
