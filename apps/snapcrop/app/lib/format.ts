/**
 * バイト数を 1024 進数で人間可読な形に整形する。
 * `1023` → `"1023 B"`, `2048` → `"2.0 KB"`, `1572864` → `"1.5 MB"`
 */
export function formatBytes(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 ** 2) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	if (bytes < 1024 ** 3) {
		return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
	}
	return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

/**
 * MIME タイプから表示用のサブタイプ名を取り出す。
 * `"image/png"` → `"PNG"`, `"image/jpeg"` → `"JPEG"`, `""` → `"不明"`
 */
export function formatMimeType(mime: string): string {
	const subtype = mime.split("/")[1];
	if (!subtype) {
		return "不明";
	}
	return subtype.toUpperCase();
}
