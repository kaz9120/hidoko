import { Redo2Icon, Undo2Icon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "~/components/shadcn-ui/button";
import { useSnapcrop } from "~/contexts/snapcrop-context";

export function SiteHeader() {
	const { canUndo, canRedo, undo, redo } = useSnapcrop();

	// Cmd/Ctrl+Z で undo、Cmd/Ctrl+Shift+Z または Cmd/Ctrl+Y で redo
	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}
			const meta = event.metaKey || event.ctrlKey;
			if (!meta) {
				return;
			}
			if (event.key === "z" && !event.shiftKey) {
				event.preventDefault();
				undo();
			} else if ((event.key === "z" && event.shiftKey) || event.key === "y") {
				event.preventDefault();
				redo();
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [undo, redo]);

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
					disabled={!canUndo}
					onClick={undo}
					size="icon-sm"
					title="元に戻す (⌘Z)"
					variant="ghost"
				>
					<Undo2Icon strokeWidth={1.75} />
				</Button>
				<Button
					aria-label="やり直す"
					disabled={!canRedo}
					onClick={redo}
					size="icon-sm"
					title="やり直す (⌘⇧Z)"
					variant="ghost"
				>
					<Redo2Icon strokeWidth={1.75} />
				</Button>
			</div>
		</header>
	);
}
