import type { CropEngineHandle } from "~/hooks/use-crop-engine";

/**
 * 現在のクロップ範囲を Blob に変換する。
 * MIME タイプを指定しない場合は image/png にフォールバックする。
 */
export async function getCroppedBlob(
	engine: CropEngineHandle,
	type = "image/png",
): Promise<Blob> {
	const canvas = engine.toCanvas({ imageSmoothingQuality: "high" });
	return await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error("Failed to encode canvas to blob"));
			}
		}, type);
	});
}

/**
 * Blob をブラウザにダウンロードさせる。<a download> を生成して click した後、
 * URL を revoke する。
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

/**
 * snapcrop-YYYYMMDD-HHmmss.png 形式のファイル名を生成する。
 */
export function makeDownloadFilename(extension = "png"): string {
	const now = new Date();
	const pad = (n: number) => n.toString().padStart(2, "0");
	const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
	return `snapcrop-${stamp}.${extension}`;
}
