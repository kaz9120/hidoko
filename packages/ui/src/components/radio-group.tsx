import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "ui/lib/utils";

function RadioGroup({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root
			data-slot="radio-group"
			className={cn("grid gap-3", className)}
			{...props}
		/>
	);
}

function RadioGroupItem({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
	return (
		<RadioGroupPrimitive.Item
			data-slot="radio-group-item"
			className={cn("hi-focus-ring", className)}
			style={{
				width: 20,
				height: 20,
				flexShrink: 0,
				borderRadius: "var(--radius-full)",
				border: "1px solid var(--border-strong)",
				background: "var(--bg-sunken)",
				cursor: "pointer",
				display: "grid",
				placeItems: "center",
				transition: `all var(--duration) var(--ease)`,
				padding: 0,
			}}
			{...props}
		>
			<RadioGroupPrimitive.Indicator
				data-slot="radio-group-indicator"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<span
					style={{
						width: 6,
						height: 6,
						borderRadius: "var(--radius-full)",
						background: "#1a0d05",
					}}
				/>
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	);
}

export { RadioGroup, RadioGroupItem };
