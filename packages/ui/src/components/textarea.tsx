import type * as React from "react";

import { cn } from "ui/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn("hi-input", className)}
			{...props}
		/>
	);
}

export { Textarea };
