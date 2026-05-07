import logoCreamUrl from "design-system/assets/logo/mark-cream.svg?url";
import logoDarkUrl from "design-system/assets/logo/mark-dark.svg?url";
import {
	ClipboardPasteIcon,
	FolderOpenIcon,
	type LucideIcon,
	MonitorIcon,
	Redo2Icon,
	RotateCwSquareIcon,
	Undo2Icon,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
	type ChangeEvent,
	type KeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import { Button } from "~/components/shadcn-ui/button";
import { Toggle } from "~/components/shadcn-ui/toggle";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "~/components/shadcn-ui/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/shadcn-ui/tooltip";
import { ThemeToggle } from "~/components/theme-toggle";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { readImageFromClipboard } from "~/lib/clipboard";
import { captureScreen, isScreenCaptureSupported } from "~/lib/screen-capture";

type AspectRatio = {
	id: string;
	label: string;
	title: string;
	/**
	 * 横長を基準とした比率。null は自由選択 (NaN) を意味する。1 (正方形) と null
	 * は portrait モードでも値が変わらないので effectiveRatio で特別扱いする。
	 */
	ratio: number | null;
};

const ASPECT_RATIOS: AspectRatio[] = [
	{ id: "free", label: "自由", title: "自由選択", ratio: null },
	{ id: "1:1", label: "1:1", title: "正方形", ratio: 1 },
	{ id: "16:9", label: "16:9", title: "ワイド", ratio: 16 / 9 },
	{ id: "4:3", label: "4:3", title: "クラシック", ratio: 4 / 3 },
	{ id: "4:5", label: "4:5", title: "インスタ投稿", ratio: 4 / 5 },
	{ id: "phi", label: "φ", title: "黄金比 (1.618:1)", ratio: 1.618 },
	{ id: "sqrt2", label: "√2", title: "白銀比 (1.414:1)", ratio: Math.SQRT2 },
	{ id: "3:2", label: "3:2", title: "写真", ratio: 3 / 2 },
];

function effectiveRatio(ratio: number | null, isPortrait: boolean): number {
	if (ratio === null) {
		return Number.NaN;
	}
	if (ratio === 1) {
		return 1;
	}
	return isPortrait ? 1 / ratio : ratio;
}

export function SiteHeader() {
	const {
		image,
		cropData,
		cropperRef,
		loadImageFromBlob,
		canUndo,
		canRedo,
		undo,
		redo,
	} = useSnapcrop();
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [selectedRatio, setSelectedRatio] = useState("free");
	const [isPortrait, setIsPortrait] = useState(false);
	const [isCapturing, setIsCapturing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const screenshotSupported = isScreenCaptureSupported();
	const hasImage = image !== null;

	useEffect(() => {
		setMounted(true);
	}, []);

	// hydration 前は dark 想定で描画。design-system は dark が初期状態。
	const logoUrl =
		mounted && resolvedTheme === "light" ? logoCreamUrl : logoDarkUrl;

	// 画像が差し替わったら比率を自由 + 横向きにリセット。識別子の変化だけを
	// 購読する意図的な「effect-as-event」パターン。
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional change-detection
	useEffect(() => {
		setSelectedRatio("free");
		setIsPortrait(false);
	}, [image]);

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

	const handleAspectChange = (next: string) => {
		// ToggleGroup type="single" は同じ項目を再クリックすると "" になるので
		// 常に何かしら選択された状態を保つために空文字を弾く
		if (!next) {
			return;
		}
		const found = ASPECT_RATIOS.find((r) => r.id === next);
		if (!found) {
			return;
		}
		setSelectedRatio(found.id);
		cropperRef.current?.setAspectRatio(effectiveRatio(found.ratio, isPortrait));
	};

	const handleOrientationToggle = (pressed: boolean) => {
		setIsPortrait(pressed);
		const current = ASPECT_RATIOS.find((r) => r.id === selectedRatio);
		if (current) {
			cropperRef.current?.setAspectRatio(
				effectiveRatio(current.ratio, pressed),
			);
		}
	};

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

	const cropWidth = cropData ? Math.round(cropData.width) : 0;
	const cropHeight = cropData ? Math.round(cropData.height) : 0;

	const setCropSize = (next: { width?: number; height?: number }) => {
		cropperRef.current?.setData(next);
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

			<Divider />

			<NumberField
				axis="w"
				disabled={!hasImage}
				onCommit={(n) => setCropSize({ width: n })}
				value={cropWidth}
			/>
			<span
				aria-hidden="true"
				className="font-mono text-muted-foreground text-xs"
			>
				×
			</span>
			<NumberField
				axis="h"
				disabled={!hasImage}
				onCommit={(n) => setCropSize({ height: n })}
				value={cropHeight}
			/>

			<Divider />

			<Toggle
				aria-label={isPortrait ? "横向きに切り替え" : "縦向きに切り替え"}
				disabled={!hasImage}
				onPressedChange={handleOrientationToggle}
				pressed={isPortrait}
				size="sm"
				title={isPortrait ? "横向きに切り替え" : "縦向きに切り替え"}
				variant="outline"
			>
				<RotateCwSquareIcon strokeWidth={1.75} />
			</Toggle>
			<ToggleGroup
				aria-label="アスペクト比"
				disabled={!hasImage}
				onValueChange={handleAspectChange}
				type="single"
				value={selectedRatio}
				variant="outline"
			>
				{ASPECT_RATIOS.map((aspect) => (
					<ToggleGroupItem
						key={aspect.id}
						size="sm"
						title={aspect.title}
						value={aspect.id}
					>
						{aspect.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>

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

/**
 * フォーカス中はユーザーの入力をそのまま保持し、blur / Enter で確定する数値入力。
 * フォーカスが外れているときだけ親から渡された value で同期する (cropper の
 * crop イベントによる値変化に追従させる)。
 */
function NumberField({
	axis,
	value,
	onCommit,
	disabled,
}: {
	axis: "w" | "h";
	value: number;
	onCommit: (next: number) => void;
	disabled?: boolean;
}) {
	const [draft, setDraft] = useState(String(value));
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (document.activeElement !== ref.current) {
			setDraft(String(value));
		}
	}, [value]);

	const commit = () => {
		const n = Number.parseInt(draft, 10);
		if (Number.isFinite(n) && n > 0) {
			onCommit(n);
		} else {
			setDraft(String(value));
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.currentTarget.blur();
		} else if (event.key === "Escape") {
			setDraft(String(value));
			event.currentTarget.blur();
		}
	};

	return (
		<input
			aria-label={axis === "w" ? "クロップ幅 (px)" : "クロップ高さ (px)"}
			className="h-7 w-14 rounded-sm border border-border bg-input/30 px-2 text-right font-mono text-foreground text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
			disabled={disabled}
			inputMode="numeric"
			onBlur={commit}
			onChange={(e) => setDraft(e.target.value)}
			onKeyDown={handleKeyDown}
			ref={ref}
			type="text"
			value={draft}
		/>
	);
}
