/**
 * Ctrl+V (paste イベント) で渡される DataTransfer から最初の画像 File を取り出す。
 * 画像が無ければ null。
 */
export function findImageInPasteEvent(data: DataTransfer): Blob | null {
	for (const item of Array.from(data.items)) {
		if (item.kind === "file" && item.type.startsWith("image/")) {
			const file = item.getAsFile();
			if (file) {
				return file;
			}
		}
	}
	return null;
}

/**
 * Async Clipboard API でクリップボードから最初の画像を読み出す。
 * navigator.clipboard.read が無い環境や、権限を拒否された場合は null を返す。
 * 必ずユーザー操作 (button click 等) の中で呼び出すこと。
 */
export async function readImageFromClipboard(): Promise<Blob | null> {
	if (!navigator.clipboard?.read) {
		return null;
	}
	try {
		const items = await navigator.clipboard.read();
		for (const item of items) {
			for (const type of item.types) {
				if (type.startsWith("image/")) {
					return await item.getType(type);
				}
			}
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Blob をクリップボードに書き込む。成功で true、API 非対応・権限拒否・
 * 形式非対応で false を返す。多くのブラウザは image/png のみ受け付けるので、
 * 呼び出し側で PNG にエンコードしてから渡すこと。
 */
export async function writeImageToClipboard(blob: Blob): Promise<boolean> {
	if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
		return false;
	}
	try {
		await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
		return true;
	} catch {
		return false;
	}
}
