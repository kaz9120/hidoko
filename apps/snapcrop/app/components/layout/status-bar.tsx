import {
	type CropData,
	type LoadedImage,
	useSnapcrop,
} from "~/contexts/snapcrop-context";
import { formatBytes, formatMimeType } from "~/lib/format";

/**
 * 画面下端 24px のステータスバー。ファイル名・元画像サイズ・形式・容量と、
 * 選択範囲 (寸法 + 出力推定容量)・図形数・履歴位置・準備状態を横一列に表示する。
 * 画像未ロード時は空のヒントだけ。
 */
export function StatusBar() {
	const { image, cropData, annotations, historyIndex, historyLength } =
		useSnapcrop();

	return (
		<StatusBarView
			annotationCount={annotations.length}
			cropData={cropData}
			historyIndex={historyIndex}
			historyLength={historyLength}
			image={image}
		/>
	);
}

/**
 * StatusBar の表示部。context から切り離した純粋な props 描画で、
 * Storybook から画像ロード後の状態を直接組み立てられるようにしている。
 */
export function StatusBarView({
	image,
	cropData,
	annotationCount,
	historyIndex,
	historyLength,
}: {
	image: LoadedImage | null;
	cropData: CropData | null;
	annotationCount: number;
	historyIndex: number;
	historyLength: number;
}) {
	// 画像未ロード時はバー自体を非表示にする。empty-hero がロゴ・コピー・
	// ショートカット案内を持っているので、ここで情報を反復する必要はない。
	if (!image) {
		return null;
	}

	const dims = `${image.width} × ${image.height}`;
	const cropDims = cropData
		? `${Math.round(cropData.width)} × ${Math.round(cropData.height)}`
		: "—";
	const estimatedBytes = estimateOutputBytes(image, cropData);

	return (
		<footer className="flex h-6 shrink-0 items-center gap-3 border-border border-t bg-bg-raised/50 px-3 font-mono text-[11px] text-text-muted">
			<span
				className="max-w-[200px] truncate text-text/80"
				title={image.fileName}
			>
				{image.fileName}
			</span>
			<Sep />
			<span className="text-text/80">{dims}</span>
			<Sep />
			<span>
				{formatMimeType(image.format)} · {formatBytes(image.fileSize)}
			</span>
			<span className="ml-auto" />
			<span>
				選択: <span className="text-text/80">{cropDims}</span>
				{estimatedBytes !== null && (
					<span> · 約 {formatBytes(estimatedBytes)}</span>
				)}
			</span>
			<Sep />
			<span>
				図形: <span className="text-text/80">{annotationCount}</span>
			</span>
			<Sep />
			<span>
				履歴:{" "}
				<span className="text-text/80">
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

/**
 * 選択範囲を書き出したときの容量の概算。元画像の bytes/pixel に選択面積を
 * 掛けるだけの近似で、再エンコードは走らせない (選択ドラッグの毎フレーム
 * 更新に追従させるため)。元画像の容量が取れないときは null。
 */
function estimateOutputBytes(
	image: LoadedImage,
	cropData: CropData | null,
): number | null {
	if (!cropData) {
		return null;
	}
	const sourcePixels = image.width * image.height;
	if (sourcePixels <= 0 || image.fileSize <= 0) {
		return null;
	}
	const ratio = (cropData.width * cropData.height) / sourcePixels;
	return Math.max(0, Math.round(image.fileSize * ratio));
}

function Sep() {
	return (
		<span aria-hidden="true" className="text-[var(--text-faint)]">
			·
		</span>
	);
}
