import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { writeImageToClipboard } from "~/lib/clipboard";
import {
	downloadBlob,
	getCroppedBlob,
	makeDownloadFilename,
} from "~/lib/image-export";

export function ExportSidebar() {
	const { image, cropperRef } = useSnapcrop();
	const [isDownloading, setIsDownloading] = useState(false);
	const [isCopying, setIsCopying] = useState(false);
	const [copyResult, setCopyResult] = useState<"idle" | "ok" | "fail">("idle");
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

	const handleCopy = async () => {
		const cropper = cropperRef.current;
		if (!cropper || isCopying) {
			return;
		}
		setIsCopying(true);
		try {
			const blob = await getCroppedBlob(cropper, "image/png");
			const ok = await writeImageToClipboard(blob);
			setCopyResult(ok ? "ok" : "fail");
			window.setTimeout(() => setCopyResult("idle"), 2000);
		} finally {
			setIsCopying(false);
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
								{copyResult === "ok" ? (
									<CheckIcon size={18} strokeWidth={1.75} />
								) : (
									<CopyIcon size={18} strokeWidth={1.75} />
								)}
							</span>
							<span className="font-medium text-foreground text-sm">
								クリップボード
							</span>
						</div>
						<span className="text-muted-foreground text-xs">
							{copyResult === "ok"
								? "コピー完了"
								: copyResult === "fail"
									? "コピーに失敗"
									: isCopying
										? "コピー中..."
										: "画像をコピー"}
						</span>
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
