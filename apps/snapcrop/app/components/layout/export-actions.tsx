import { CopyIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import { Kbd } from "ui/components/kbd";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { writeImageToClipboard } from "~/lib/clipboard";
import {
	downloadBlob,
	getCroppedBlob,
	makeDownloadFilename,
} from "~/lib/image-export";

/**
 * ヘッダー右端の書き出しアクション群 (PNG ダウンロード / クリップボードへ
 * コピー)。クロップ結果に矩形・矢印・テキスト・ハイライトの注釈を焼き込んで
 * 書き出す。コピーは ⌘C ショートカット (use-copy-shortcut.ts) と同じ処理。
 */
export function ExportActions() {
	const { cropperRef, image, annotations, arrows, texts, highlights } =
		useSnapcrop();
	const [isCopying, setIsCopying] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);

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
		<ExportActionsView
			disabled={!image}
			isCopying={isCopying}
			isDownloading={isDownloading}
			onCopy={() => void handleCopy()}
			onDownload={() => void handleDownload()}
		/>
	);
}

export type ExportActionsViewProps = {
	/** 画像未ロードなど、書き出し対象がないときに全体を無効化する。 */
	disabled?: boolean;
	isCopying?: boolean;
	isDownloading?: boolean;
	onCopy: () => void;
	onDownload: () => void;
};

/**
 * ExportActions の表示部。Storybook から状態を注入できるよう、context に
 * 依存しない props 駆動のコンポーネントとして切り出している。
 */
export function ExportActionsView({
	disabled,
	isCopying,
	isDownloading,
	onCopy,
	onDownload,
}: ExportActionsViewProps) {
	return (
		<div className="flex items-center gap-1">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						aria-busy={isDownloading}
						aria-label="PNG でダウンロード"
						disabled={disabled || isDownloading}
						onClick={onDownload}
						size="icon-sm"
						variant="ghost"
					>
						<DownloadIcon strokeWidth={1.75} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>PNG でダウンロード</TooltipContent>
			</Tooltip>
			<Button
				aria-busy={isCopying}
				className="rounded-full"
				disabled={disabled || isCopying}
				onClick={onCopy}
				size="sm"
			>
				<CopyIcon strokeWidth={2} />
				コピー
				<Kbd className="bg-primary-foreground/15 text-primary-foreground/80">
					⌘C
				</Kbd>
			</Button>
		</div>
	);
}
