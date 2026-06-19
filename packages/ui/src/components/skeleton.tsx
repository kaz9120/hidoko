import { cn } from "ui/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("hi-motion-ember-pulse rounded-md", className)}
			{...props}
		/>
	);
}

export { Skeleton };
