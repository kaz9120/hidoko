import logoUrl from "design-system/assets/logo/mark-dark.svg?url";
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
				<img alt="" aria-hidden="true" className="size-7" src={logoUrl} />
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
