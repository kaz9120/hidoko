import { ImageIcon } from "lucide-react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { useFileDrop } from "~/hooks/use-file-drop";

export function EditorCanvas() {
	const { image, loadImageFromBlob } = useSnapcrop();
	const isDragging = useFileDrop(loadImageFromBlob);

	if (image) {
		return (
			<section className="relative flex flex-1 items-center justify-center overflow-hidden p-5">
				<img
					alt="編集中の画像"
					className="max-h-full max-w-full object-contain"
					src={image.src}
				/>
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
