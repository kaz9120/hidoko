import Cropper from "cropperjs";
import { ImageIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { useFileDrop } from "~/hooks/use-file-drop";

export function EditorCanvas() {
	const { image, loadImageFromBlob, cropperRef } = useSnapcrop();
	const isDragging = useFileDrop(loadImageFromBlob);
	const imgRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		const imgElement = imgRef.current;
		if (!image || !imgElement) {
			return;
		}

		const initialize = () => {
			const cropper = new Cropper(imgElement, {
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
			});
			cropperRef.current = cropper;
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
			cropperRef.current?.destroy();
			cropperRef.current = null;
		};
	}, [image, cropperRef]);

	if (image) {
		return (
			<section className="relative flex flex-1 overflow-hidden p-5">
				<div className="size-full overflow-hidden">
					<img
						alt="編集中の画像"
						className="block max-w-full"
						ref={imgRef}
						src={image.src}
					/>
				</div>
				{isDragging && <DropOverlay />}
			</section>
		);
	}

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
						または左側のメニューから選択
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
