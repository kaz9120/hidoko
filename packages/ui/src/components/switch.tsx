import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "ui/lib/utils";

function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn("hi-focus-ring", className)}
			style={{
				display: "inline-flex",
				alignItems: "center",
				flexShrink: 0,
				width: 40,
				height: 24,
				borderRadius: "var(--radius-full)",
				border: "none",
				cursor: "pointer",
				transition: `background var(--duration) var(--ease)`,
				minHeight: "var(--a11y-target-min)",
				padding: 0,
			}}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				style={{
					display: "block",
					width: 20,
					height: 20,
					borderRadius: "var(--radius-full)",
					pointerEvents: "none",
					transition: `all var(--duration) var(--ease)`,
				}}
				className="data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[2px]"
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
