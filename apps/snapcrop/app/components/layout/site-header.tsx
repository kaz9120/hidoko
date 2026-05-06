import { Redo2Icon, Undo2Icon } from "lucide-react";
import { Button } from "~/components/shadcn-ui/button";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
			<h1 className="flex items-center gap-2.5 font-semibold text-2xl text-foreground">
				<svg
					aria-hidden="true"
					className="size-7 fill-current"
					viewBox="0 0 512 512"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M434.088,367.849V77.361H144.71V0.551H77.92v76.81H0v66.774h77.92v290.504h289.378v76.81h66.79v-76.81H512v-66.79H434.088z M367.298,367.849H144.71V144.135h222.588V367.849z" />
				</svg>
				snapcrop
			</h1>
			<div className="flex items-center gap-1.5">
				<Button
					aria-label="元に戻す"
					disabled
					size="icon-sm"
					title="元に戻す"
					variant="ghost"
				>
					<Undo2Icon strokeWidth={1.75} />
				</Button>
				<Button
					aria-label="やり直す"
					disabled
					size="icon-sm"
					title="やり直す"
					variant="ghost"
				>
					<Redo2Icon strokeWidth={1.75} />
				</Button>
			</div>
		</header>
	);
}
