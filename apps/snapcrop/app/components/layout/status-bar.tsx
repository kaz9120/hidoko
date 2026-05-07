import { useSnapcrop } from "~/contexts/snapcrop-context";
import { formatBytes, formatMimeType } from "~/lib/format";

/**
 * 画面下端 24px のステータスバー。画像情報・選択範囲・履歴位置・準備状態を
 * 横一列に表示する。画像未ロード時は空のヒントだけ。
 */
export function StatusBar() {
	const { image, cropData, historyIndex, historyLength } = useSnapcrop();

	if (!image) {
		return (
			<footer className="flex h-6 shrink-0 items-center gap-3 border-border border-t bg-card/50 px-3 font-mono text-[11px] text-muted-foreground">
				<span>画像が未ロードです</span>
				<span className="ml-auto">⌘V で貼り付け</span>
			</footer>
		);
	}

	const dims = `${image.width} × ${image.height}`;
	const cropDims = cropData
		? `${Math.round(cropData.width)} × ${Math.round(cropData.height)}`
		: "—";

	return (
		<footer className="flex h-6 shrink-0 items-center gap-3 border-border border-t bg-card/50 px-3 font-mono text-[11px] text-muted-foreground">
			<span className="text-foreground/80">{dims}</span>
			<Sep />
			<span>
				{formatMimeType(image.format)} · {formatBytes(image.fileSize)}
			</span>
			<span className="ml-auto" />
			<span>
				選択: <span className="text-foreground/80">{cropDims}</span>
			</span>
			<Sep />
			<span>
				履歴:{" "}
				<span className="text-foreground/80">
					{historyIndex + 1} / {historyLength}
				</span>
			</span>
			<Sep />
			<span aria-hidden="true" className="text-[var(--moss)]">
				●
			</span>
			<span>準備完了</span>
		</footer>
	);
}

function Sep() {
	return (
		<span aria-hidden="true" className="text-[var(--text-faint)]">
			·
		</span>
	);
}
