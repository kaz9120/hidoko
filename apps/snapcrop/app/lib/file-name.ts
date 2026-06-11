/**
 * 画像の取り込み経路。名前を持たない blob (貼り付け / スクリーンキャプチャ)
 * に生成名を与えるとき、prefix の選択に使う。
 */
export type ImageSource = "file" | "clipboard" | "screen-capture";

const SOURCE_PREFIX: Record<ImageSource, string> = {
	file: "image",
	clipboard: "clipboard",
	"screen-capture": "screenshot",
};

/**
 * 取り込んだ画像の表示用ファイル名を決める。
 * - File 由来で名前があればそのまま使う
 * - 名前がない blob は `clipboard-20260610-153000.png` のような
 *   経路 prefix + タイムスタンプの生成名にする
 */
export function resolveImageFileName(blob: Blob, source: ImageSource): string {
	if (blob instanceof File && blob.name) {
		return blob.name;
	}
	const now = new Date();
	const pad = (n: number) => n.toString().padStart(2, "0");
	const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
	return `${SOURCE_PREFIX[source]}-${stamp}.${extensionFromMime(blob.type)}`;
}

function extensionFromMime(mime: string): string {
	const subtype = mime.split("/")[1];
	if (!subtype) {
		return "png";
	}
	if (subtype === "jpeg") {
		return "jpg";
	}
	if (subtype === "svg+xml") {
		return "svg";
	}
	return subtype;
}
