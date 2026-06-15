import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { ImageStage } from "~/components/canvas/image-stage";
import { Viewport } from "~/components/canvas/viewport";
import { EmptyHero } from "~/components/layout/empty-hero";
import { SelectionToolbar } from "~/components/layout/selection-toolbar";
import { ToolRail } from "~/components/layout/tool-rail";
import { type LoadedImage, useSnapcrop } from "~/contexts/snapcrop-context";
import { useArrowShortcuts } from "~/hooks/use-arrow-shortcuts";
import { useCanvasShortcuts } from "~/hooks/use-canvas-shortcuts";
import { useClipboardPaste } from "~/hooks/use-clipboard-paste";
import { useCopyShortcut } from "~/hooks/use-copy-shortcut";
import { useCropEngine } from "~/hooks/use-crop-engine";
import { useDuplicateShortcut } from "~/hooks/use-duplicate-shortcut";
import { useFileDrop } from "~/hooks/use-file-drop";
import { useHighlightShortcuts } from "~/hooks/use-highlight-shortcuts";
import { useRectShortcuts } from "~/hooks/use-rect-shortcuts";
import { useSelectAllShortcut } from "~/hooks/use-select-all-shortcut";
import { useStylePresetShortcuts } from "~/hooks/use-style-preset-shortcuts";
import { useTextShortcuts } from "~/hooks/use-text-shortcuts";
import { useZOrderShortcuts } from "~/hooks/use-z-order-shortcuts";

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
	useDuplicateShortcut();
	useZOrderShortcuts();
	useStylePresetShortcuts();

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
				<SelectionToolbar />
				{isDragging && <DropOverlay />}
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
