import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "ui/lib/utils";

function Checkbox({
	className,
	...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn("hi-focus-ring", className)}
			style={{
				width: 20,
				height: 20,
				flexShrink: 0,
				display: "grid",
				placeItems: "center",
				border: "1px solid var(--border-strong)",
				borderRadius: "var(--radius-xs)",
				background: "var(--bg-sunken)",
				cursor: "pointer",
				transition: `all var(--duration) var(--ease)`,
			}}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				style={{ display: "grid", placeContent: "center", color: "#1a0d05" }}
			>
				<CheckIcon style={{ width: 14, height: 14 }} />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
