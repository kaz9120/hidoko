import logoCreamUrl from "design-system/assets/logo/mark-cream.svg?url";
import logoDarkUrl from "design-system/assets/logo/mark-dark.svg?url";
import {
	DownloadIcon,
	PanelLeftIcon,
	Redo2Icon,
	Undo2Icon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "~/components/shadcn-ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/shadcn-ui/tooltip";
import { ThemeToggle } from "~/components/theme-toggle";
import { useSnapcrop } from "~/contexts/snapcrop-context";

type SiteHeaderProps = {
	onOpenInputSidebar: () => void;
	onOpenExportSidebar: () => void;
};

export function SiteHeader({
	onOpenInputSidebar,
	onOpenExportSidebar,
}: SiteHeaderProps) {
	const { canUndo, canRedo, undo, redo } = useSnapcrop();
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// hydration 前は dark 想定で描画。design-system は dark が初期状態。
	const logoUrl =
		mounted && resolvedTheme === "light" ? logoCreamUrl : logoDarkUrl;

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
		<header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-3 py-3 backdrop-blur md:px-5">
			<div className="flex items-center gap-2">
				<TooltipIconButton
					className="md:hidden"
					label="入力サイドバーを開く"
					onClick={onOpenInputSidebar}
				>
					<PanelLeftIcon strokeWidth={1.75} />
				</TooltipIconButton>
				<h1 className="flex items-center gap-2.5 font-semibold text-2xl text-foreground">
					<img alt="" aria-hidden="true" className="size-7" src={logoUrl} />
					snapcrop
				</h1>
			</div>
			<div className="flex items-center gap-1.5">
				<TooltipIconButton
					disabled={!canUndo}
					label="元に戻す (⌘Z)"
					onClick={undo}
				>
					<Undo2Icon strokeWidth={1.75} />
				</TooltipIconButton>
				<TooltipIconButton
					disabled={!canRedo}
					label="やり直す (⌘⇧Z)"
					onClick={redo}
				>
					<Redo2Icon strokeWidth={1.75} />
				</TooltipIconButton>
				<ThemeToggle />
				<TooltipIconButton
					className="md:hidden"
					label="エクスポートサイドバーを開く"
					onClick={onOpenExportSidebar}
				>
					<DownloadIcon strokeWidth={1.75} />
				</TooltipIconButton>
			</div>
		</header>
	);
}

function TooltipIconButton({
	label,
	onClick,
	disabled,
	className,
	children,
}: {
	label: string;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
	children: ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					aria-label={label}
					className={className}
					disabled={disabled}
					onClick={onClick}
					size="icon-sm"
					variant="ghost"
				>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}
