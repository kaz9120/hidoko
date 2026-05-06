import { CopyIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import {
	downloadBlob,
	getCroppedBlob,
	makeDownloadFilename,
} from "~/lib/image-export";

export function ExportSidebar() {
	const { image, cropperRef } = useSnapcrop();
	const [isDownloading, setIsDownloading] = useState(false);
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
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<aside className="hidden w-72 shrink-0 overflow-y-auto border-border border-l bg-card md:block">
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
						className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 text-left opacity-50"
						disabled
						type="button"
					>
						<div className="flex items-center gap-3">
							<span className="text-muted-foreground">
								<CopyIcon size={18} strokeWidth={1.75} />
							</span>
							<span className="font-medium text-foreground text-sm">
								クリップボード
							</span>
						</div>
						<span className="text-muted-foreground text-xs">画像をコピー</span>
					</button>
				</div>
			</div>

			<div className="p-5">
				<h2 className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
					画像情報
				</h2>
				<dl className="flex flex-col gap-2 text-sm">
					<div className="flex items-baseline justify-between gap-4">
						<dt className="text-muted-foreground">サイズ:</dt>
						<dd className="text-foreground/60">—</dd>
					</div>
					<div className="flex items-baseline justify-between gap-4">
						<dt className="text-muted-foreground">ファイルサイズ:</dt>
						<dd className="text-foreground/60">—</dd>
					</div>
					<div className="flex items-baseline justify-between gap-4">
						<dt className="text-muted-foreground">形式:</dt>
						<dd className="text-foreground/60">—</dd>
					</div>
				</dl>
			</div>
		</aside>
	);
}
