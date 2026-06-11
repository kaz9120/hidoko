import { CopyIcon, DownloadIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui";
import { ImageStage } from "~/components/canvas/image-stage";
import { Viewport } from "~/components/canvas/viewport";
import { EmptyHero } from "~/components/layout/empty-hero";
import { ToolRail } from "~/components/layout/tool-rail";
import { type LoadedImage, useSnapcrop } from "~/contexts/snapcrop-context";
import { useArrowShortcuts } from "~/hooks/use-arrow-shortcuts";
import { useCanvasShortcuts } from "~/hooks/use-canvas-shortcuts";
import { useClipboardPaste } from "~/hooks/use-clipboard-paste";
import { useCopyShortcut } from "~/hooks/use-copy-shortcut";
import { useCropEngine } from "~/hooks/use-crop-engine";
import { useFileDrop } from "~/hooks/use-file-drop";
import { useHighlightShortcuts } from "~/hooks/use-highlight-shortcuts";
import { useRectShortcuts } from "~/hooks/use-rect-shortcuts";
import { useSelectAllShortcut } from "~/hooks/use-select-all-shortcut";
import { useTextShortcuts } from "~/hooks/use-text-shortcuts";
import { writeImageToClipboard } from "~/lib/clipboard";
import {
	downloadBlob,
	getCroppedBlob,
	makeDownloadFilename,
} from "~/lib/image-export";

export function EditorCanvas() {
	const {
		image,
		loadImageFromBlob,
		cropperRef,
		annotations,
		arrows,
		texts,
		highlights,
	} = useSnapcrop();
	const isDragging = useFileDrop(loadImageFromBlob);
	useClipboardPaste((blob) => void loadImageFromBlob(blob, "clipboard"));
	useCopyShortcut({
		cropperRef,
		hasImage: image !== null,
		annotations,
		arrows,
		texts,
		highlights,
		onSuccess: () => toast.success("クリップボードにコピーしました"),
		onFailure: () => toast.error("クリップボードへのコピーに失敗しました"),
	});
	useSelectAllShortcut({ cropperRef, hasImage: image !== null });
	useRectShortcuts();
	useArrowShortcuts();
	useTextShortcuts();
	useHighlightShortcuts();

	if (image) {
		// 画像 src が変わったら engine を作り直すために key を付ける。
		return (
			<ImageCanvas image={image} isDragging={isDragging} key={image.src} />
		);
	}

	return <EmptyHero isDragging={isDragging} />;
}

function ImageCanvas({
	image,
	isDragging,
}: {
	image: LoadedImage;
	isDragging: boolean;
}) {
	// zoom / viewportRef は context 持ち。ヘッダーの ZoomControl が % 表示と
	// fit / 拡縮の操作で参照するため、ここで Viewport と結線する。
	const { cropperRef, setCropData, zoom, setZoom, viewportRef } = useSnapcrop();
	const imgRef = useRef<HTMLImageElement | null>(null);

	const imageMetrics = useMemo(
		() => ({ naturalWidth: image.width, naturalHeight: image.height }),
		[image.width, image.height],
	);

	const engine = useCropEngine({
		image: imageMetrics,
		imgElementRef: imgRef,
		onChange: setCropData,
	});

	// engine の imperative ハンドルを context に張る。site-header / hooks は
	// cropperRef 経由で setAspectRatio / setData / selectAll などを呼ぶ。
	useEffect(() => {
		cropperRef.current = engine.handle;
		return () => {
			cropperRef.current = null;
		};
	}, [cropperRef, engine.handle]);

	// この ImageCanvas が unmount される時 (画像クリア時) は cropData も落とす。
	useEffect(() => {
		return () => setCropData(null);
	}, [setCropData]);

	useCanvasShortcuts(viewportRef);

	return (
		<section className="relative flex flex-1 overflow-hidden bg-[var(--ink-0)]">
			<ToolRail />
			<div className="relative min-w-0 flex-1">
				<Viewport
					image={{ width: image.width, height: image.height }}
					onZoomChange={setZoom}
					ref={viewportRef}
					zoom={zoom}
				>
					<ImageStage
						cropEngine={engine}
						image={image}
						imgRef={imgRef}
						zoom={zoom}
					/>
				</Viewport>
				{isDragging && <DropOverlay />}
				<CanvasActions />
			</div>
		</section>
	);
}

function CanvasActions() {
	const { cropperRef, image, annotations, arrows, texts, highlights } =
		useSnapcrop();
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
			const blob = await getCroppedBlob(
				cropper,
				"image/png",
				annotations,
				arrows,
				texts,
				highlights,
			);
			const ok = await writeImageToClipboard(blob);
			if (ok) {
				toast.success("クリップボードにコピーしました");
			} else {
				toast.error("クリップボードへのコピーに失敗しました");
			}
		} catch {
			toast.error("クリップボードへのコピーに失敗しました");
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
			const blob = await getCroppedBlob(
				cropper,
				"image/png",
				annotations,
				arrows,
				texts,
				highlights,
			);
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

function DropOverlay() {
	return (
		<div className="pointer-events-none absolute inset-5 flex items-center justify-center rounded-xl border-2 border-primary border-dashed bg-primary/10">
			<p className="font-medium text-foreground text-lg">
				ここにドロップして差し替え
			</p>
		</div>
	);
}
