import { CopyIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageInfo } from "~/components/layout/image-info";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { writeImageToClipboard } from "~/lib/clipboard";
import {
	downloadBlob,
	getCroppedBlob,
	makeDownloadFilename,
} from "~/lib/image-export";

type ExportSidebarProps = {
	mobileVisible: boolean;
};

export function ExportSidebar({ mobileVisible }: ExportSidebarProps) {
	const { image, cropperRef } = useSnapcrop();
	const [isDownloading, setIsDownloading] = useState(false);
	const [isCopying, setIsCopying] = useState(false);
	const hasImage = image !== null;

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

	return (
		<aside
			className={`${mobileVisible ? "flex" : "hidden"} w-full shrink-0 flex-col overflow-y-auto border-border bg-card md:flex md:w-72 md:border-l`}
		>
			<div className="border-border border-b p-5">
				<h2 className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
					エクスポート
				</h2>
				<div className="flex flex-col gap-2.5">
					<button
						aria-busy={isDownloading}
						className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary hover:bg-muted disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-background"
						disabled={!hasImage || isDownloading}
						onClick={handleDownload}
						type="button"
					>
						<div className="flex items-center gap-3">
							<span
								className={hasImage ? "text-primary" : "text-muted-foreground"}
							>
								<DownloadIcon size={18} strokeWidth={1.75} />
							</span>
							<span className="font-medium text-foreground text-sm">
								ダウンロード
							</span>
						</div>
						<span className="text-muted-foreground text-xs">
							{isDownloading ? "保存中..." : "PNG形式で保存"}
						</span>
					</button>
					<button
						aria-busy={isCopying}
						className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary hover:bg-muted disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-background"
						disabled={!hasImage || isCopying}
						onClick={handleCopy}
						type="button"
					>
						<div className="flex items-center gap-3">
							<span
								className={hasImage ? "text-primary" : "text-muted-foreground"}
							>
								<CopyIcon size={18} strokeWidth={1.75} />
							</span>
							<span className="font-medium text-foreground text-sm">
								クリップボード
							</span>
						</div>
						<span className="text-muted-foreground text-xs">
							{isCopying ? "コピー中..." : "画像をコピー"}
						</span>
					</button>
				</div>
			</div>

			<ImageInfo />
		</aside>
	);
}
