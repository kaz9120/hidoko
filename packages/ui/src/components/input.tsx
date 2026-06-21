import type * as React from "react";

import { cn } from "ui/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn("hi-input", className)}
			{...props}
		/>
	);
}

export { Input };
