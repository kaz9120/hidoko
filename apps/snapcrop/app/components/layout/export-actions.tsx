import { CopyIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import {
	Button,
	Kbd,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	toast,
} from "takibi-design-system";
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
	const {
		cropperRef,
		image,
		crop,
		cropEditing,
		commitCrop,
		annotations,
		arrows,
		texts,
		highlights,
	} = useSnapcrop();
	const [isCopying, setIsCopying] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);

	// 枠を触っている途中で書き出したら、そこで確定させる。書き出した直後の
	// 画面が、書き出した内容そのものになる。
	const exportRect = () => {
		if (!cropEditing) return crop;
		const rect = cropperRef.current?.getData() ?? null;
		commitCrop();
		return rect;
	};

	const handleCopy = async () => {
		const cropper = cropperRef.current;
		if (!cropper || isCopying) {
			return;
		}
		setIsCopying(true);
		try {
			const blob = await getCroppedBlob(cropper, {
				rect: exportRect() ?? undefined,
				annotations,
				arrows,
				texts,
				highlights,
			});
			const ok = await writeImageToClipboard(blob);
			if (ok) {
				toast.add({ title: "クリップボードにコピーしました", type: "success" });
			} else {
				toast.add({
					title: "クリップボードへのコピーに失敗しました",
					type: "danger",
				});
			}
		} catch {
			toast.add({
				title: "クリップボードへのコピーに失敗しました",
				type: "danger",
			});
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
			const blob = await getCroppedBlob(cropper, {
				rect: exportRect() ?? undefined,
				annotations,
				arrows,
				texts,
				highlights,
			});
			downloadBlob(blob, makeDownloadFilename("png"));
		} catch {
			toast.add({ title: "画像の書き出しに失敗しました", type: "danger" });
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
				<TooltipTrigger
					render={
						<Button
							aria-busy={isDownloading}
							aria-label="PNG でダウンロード"
							disabled={disabled || isDownloading}
							onClick={onDownload}
							size="icon"
							variant="ghost"
						/>
					}
				>
					<DownloadIcon strokeWidth={1.75} />
				</TooltipTrigger>
				<TooltipContent>PNG でダウンロード</TooltipContent>
			</Tooltip>
			<Button
				aria-busy={isCopying}
				disabled={disabled || isCopying}
				onClick={onCopy}
				size="sm"
			>
				<CopyIcon className="[stroke-width:2]" />
				コピー
				<Kbd className="border-transparent bg-fg-on-brand/15 text-fg-on-brand/80">
					⌘C
				</Kbd>
			</Button>
		</div>
	);
}
