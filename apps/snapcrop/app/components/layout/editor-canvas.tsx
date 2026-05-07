import Cropper from "cropperjs";
import { CopyIcon, DownloadIcon, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/shadcn-ui/tooltip";
import { type LoadedImage, useSnapcrop } from "~/contexts/snapcrop-context";
import { useClipboardPaste } from "~/hooks/use-clipboard-paste";
import { useCopyShortcut } from "~/hooks/use-copy-shortcut";
import { useFileDrop } from "~/hooks/use-file-drop";
import { writeImageToClipboard } from "~/lib/clipboard";
import {
	downloadBlob,
	getCroppedBlob,
	makeDownloadFilename,
} from "~/lib/image-export";

export function EditorCanvas() {
	const { image, loadImageFromBlob, cropperRef } = useSnapcrop();
	const isDragging = useFileDrop(loadImageFromBlob);
	useClipboardPaste(loadImageFromBlob);
	useCopyShortcut({
		cropperRef,
		hasImage: image !== null,
		onSuccess: () => toast.success("クリップボードにコピーしました"),
		onFailure: () => toast.error("クリップボードへのコピーに失敗しました"),
	});

	if (image) {
		// 画像 src が変わったら Cropper を作り直すために key を付ける。再 mount で
		// useEffect の cleanup → init が走り、ref とイベントが整合する。
		return (
			<ImageCanvas image={image} isDragging={isDragging} key={image.src} />
		);
	}

	return <EmptyState isDragging={isDragging} />;
}

function ImageCanvas({
	image,
	isDragging,
}: {
	image: LoadedImage;
	isDragging: boolean;
}) {
	const { cropperRef, setCropData } = useSnapcrop();
	const imgRef = useRef<HTMLImageElement>(null);
	const [hudPos, setHudPos] = useState<{
		left: number;
		top: number;
	} | null>(null);

	useEffect(() => {
		const imgElement = imgRef.current;
		if (!imgElement) {
			return;
		}

		let cropper: Cropper | null = null;

		const sync = () => {
			if (!cropper) {
				return;
			}
			const box = cropper.getCropBoxData();
			setHudPos({ left: box.left, top: box.top + box.height + 8 });
			setCropData(cropper.getData());
		};

		const initialize = () => {
			cropper = new Cropper(imgElement, {
				aspectRatio: Number.NaN,
				viewMode: 1,
				minCropBoxWidth: 50,
				minCropBoxHeight: 50,
				responsive: true,
				restore: true,
				center: true,
				highlight: true,
				cropBoxMovable: true,
				cropBoxResizable: true,
				toggleDragModeOnDblclick: false,
				ready: sync,
			});
			cropperRef.current = cropper;
			imgElement.addEventListener("crop", sync);
		};

		// 画像のロードが完了してから Cropper を初期化する。React が <img> を mount
		// した時点で src は設定済みなので、complete を確認してから分岐する。
		if (imgElement.complete) {
			initialize();
		} else {
			imgElement.addEventListener("load", initialize, { once: true });
		}

		return () => {
			imgElement.removeEventListener("load", initialize);
			imgElement.removeEventListener("crop", sync);
			cropper?.destroy();
			cropperRef.current = null;
			setCropData(null);
		};
	}, [cropperRef, setCropData]);

	return (
		<section className="relative flex flex-1 overflow-hidden bg-[var(--ink-0)]">
			<div className="relative size-full overflow-hidden">
				<img
					alt="編集中の画像"
					className="block max-w-full"
					ref={imgRef}
					src={image.src}
				/>
				<SizeHud hudPos={hudPos} />
			</div>
			{isDragging && <DropOverlay />}
			<CanvasActions />
		</section>
	);
}

function SizeHud({ hudPos }: { hudPos: { left: number; top: number } | null }) {
	const { cropData } = useSnapcrop();

	if (!hudPos || !cropData) {
		return null;
	}

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute z-10 whitespace-nowrap rounded-sm border border-border bg-card px-2 py-1 font-mono text-foreground text-xs shadow-md"
			style={{ left: hudPos.left, top: hudPos.top }}
		>
			{Math.round(cropData.width)} × {Math.round(cropData.height)}
		</div>
	);
}

function CanvasActions() {
	const { cropperRef, image } = useSnapcrop();
	const [isCopying, setIsCopying] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);

	if (!image) {
		return null;
	}

	const handleCopy = async () => {
		const cropper = cropperRef.current;
		if (!cropper || isCopying) {
			return;
		}
		setIsCopying(true);
		try {
			const blob = await getCroppedBlob(cropper, "image/png");
			const ok = await writeImageToClipboard(blob);
			if (ok) {
				toast.success("クリップボードにコピーしました");
			} else {
				toast.error("クリップボードへのコピーに失敗しました");
			}
		} finally {
			setIsCopying(false);
		}
	};

	const handleDownload = async () => {
		const cropper = cropperRef.current;
		if (!cropper || isDownloading) {
			return;
		}
		setIsDownloading(true);
		try {
			const blob = await getCroppedBlob(cropper, "image/png");
			downloadBlob(blob, makeDownloadFilename("png"));
		} catch {
			toast.error("画像の書き出しに失敗しました");
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="absolute right-5 bottom-5 flex items-center gap-2.5">
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						aria-busy={isDownloading}
						aria-label="PNG でダウンロード"
						className="flex size-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground/80 backdrop-blur-md transition-colors hover:bg-card disabled:opacity-50"
						disabled={isDownloading}
						onClick={handleDownload}
						type="button"
					>
						<DownloadIcon size={16} strokeWidth={1.75} />
					</button>
				</TooltipTrigger>
				<TooltipContent>PNG でダウンロード</TooltipContent>
			</Tooltip>
			<button
				aria-busy={isCopying}
				aria-label="クリップボードへコピー"
				className="flex h-10 items-center gap-2 rounded-full border border-[var(--ember-600)] bg-gradient-to-b from-[var(--ember-300)] to-[var(--ember-500)] px-5 font-semibold text-[#1a0d05] text-sm shadow-[0_4px_24px_rgba(244,125,58,0.35),0_1px_0_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,240,220,0.35)] transition-all hover:from-[var(--ember-200)] hover:to-[var(--ember-400)] disabled:opacity-50"
				disabled={isCopying}
				onClick={handleCopy}
				type="button"
			>
				<CopyIcon size={16} strokeWidth={2} />
				<span>コピー</span>
				<span className="ml-1 rounded-sm bg-black/20 px-1.5 py-px font-mono text-[10px] text-black/70">
					⌘C
				</span>
			</button>
		</div>
	);
}

function EmptyState({ isDragging }: { isDragging: boolean }) {
	return (
		<section className="relative flex flex-1 items-center justify-center overflow-hidden p-5">
			<div
				className={`absolute inset-5 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed text-center transition-colors ${
					isDragging ? "border-primary bg-primary/10" : "border-border"
				}`}
			>
				<ImageIcon
					className={`opacity-40 transition-colors ${
						isDragging ? "text-primary" : "text-muted-foreground"
					}`}
					size={64}
					strokeWidth={1.5}
				/>
				<div className="flex flex-col gap-2">
					<p className="text-foreground/80 text-lg">画像をドラッグ＆ドロップ</p>
					<p className="text-muted-foreground text-sm">
						または上部メニューから取り込み (⌘V で貼付)
					</p>
				</div>
			</div>
		</section>
	);
}

function DropOverlay() {
	return (
		<div className="pointer-events-none absolute inset-5 flex items-center justify-center rounded-xl border-2 border-primary border-dashed bg-primary/10">
			<p className="font-medium text-foreground text-lg">
				ここにドロップして差し替え
			</p>
		</div>
	);
}
