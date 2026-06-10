import {
	ClipboardPasteIcon,
	FolderOpenIcon,
	type LucideIcon,
	MonitorIcon,
	Redo2Icon,
	Undo2Icon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import logoCreamUrl from "ui/assets/logo/mark-cream.svg?url";
import logoDarkUrl from "ui/assets/logo/mark-dark.svg?url";
import { ShareButton } from "~/components/layout/share-button";
import { ThemeToggle } from "~/components/theme-toggle";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { readImageFromClipboard } from "~/lib/clipboard";
import { captureScreen, isScreenCaptureSupported } from "~/lib/screen-capture";

export function SiteHeader() {
	const { loadImageFromBlob, canUndo, canRedo, undo, redo } = useSnapcrop();
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [isCapturing, setIsCapturing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const screenshotSupported = isScreenCaptureSupported();

	useEffect(() => {
		setMounted(true);
	}, []);

	// hydration 前は dark 想定で描画。tokens.css は dark が初期状態。
	const logoUrl =
		mounted && resolvedTheme === "light" ? logoCreamUrl : logoDarkUrl;

	// Cmd/Ctrl+Z で undo、Cmd/Ctrl+Shift+Z または Cmd/Ctrl+Y で redo
	useEffect(() => {
		const handler = (event: globalThis.KeyboardEvent) => {
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

	const handleScreenshot = async () => {
		if (isCapturing) {
			return;
		}
		setIsCapturing(true);
		try {
			const blob = await captureScreen();
			if (blob) {
				await loadImageFromBlob(blob);
			}
		} finally {
			setIsCapturing(false);
		}
	};

	const handlePaste = async () => {
		const blob = await readImageFromClipboard();
		if (blob) {
			await loadImageFromBlob(blob);
		} else {
			toast.error("クリップボードに画像が見つかりません");
		}
	};

	const handleFileButtonClick = () => fileInputRef.current?.click();

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}
		await loadImageFromBlob(file);
		event.target.value = "";
	};

	return (
		<header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-border border-b bg-background/95 px-3 py-2 backdrop-blur md:px-4">
			<h1 className="flex items-center gap-2 font-semibold text-foreground text-lg">
				<img alt="" aria-hidden="true" className="size-6" src={logoUrl} />
				snapcrop
			</h1>

			<Divider />

			<TooltipIconButton
				disabled={!screenshotSupported || isCapturing}
				icon={MonitorIcon}
				label={
					screenshotSupported
						? isCapturing
							? "キャプチャ中..."
							: "スクリーンショット"
						: "スクリーンショット (このブラウザでは利用不可)"
				}
				onClick={handleScreenshot}
			/>
			<TooltipIconButton
				icon={ClipboardPasteIcon}
				label="貼り付け (⌘V)"
				onClick={handlePaste}
			/>
			<TooltipIconButton
				icon={FolderOpenIcon}
				label="ファイルを開く"
				onClick={handleFileButtonClick}
			/>
			<input
				accept="image/*"
				className="hidden"
				onChange={handleFileChange}
				ref={fileInputRef}
				type="file"
			/>

			<div className="ml-auto flex items-center gap-1">
				<TooltipIconButton
					disabled={!canUndo}
					icon={Undo2Icon}
					label="元に戻す (⌘Z)"
					onClick={undo}
				/>
				<TooltipIconButton
					disabled={!canRedo}
					icon={Redo2Icon}
					label="やり直す (⌘⇧Z)"
					onClick={redo}
				/>
				<ThemeToggle />
				<Divider />
				<ShareButton />
			</div>
		</header>
	);
}

function Divider() {
	return <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />;
}

function TooltipIconButton({
	icon: Icon,
	label,
	onClick,
	disabled,
}: {
	icon: LucideIcon;
	label: string;
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					aria-label={label}
					disabled={disabled}
					onClick={onClick}
					size="icon-sm"
					variant="ghost"
				>
					<Icon strokeWidth={1.75} />
				</Button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}
