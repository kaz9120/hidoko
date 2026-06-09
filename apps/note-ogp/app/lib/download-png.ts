import { toPng } from "html-to-image";

const OGP_W = 1280;
const OGP_H = 670;

export function buildFileName(title: string, issue: string): string {
	const safeTitle = (title || "ogp")
		.replace(/\n/g, " ")
		.replace(/[\\/:*?"<>|\s]+/g, "_")
		.slice(0, 32);
	// localStorage 直編集など input フォームを経由しないルートで `/` 等が
	// 入っても、ファイル名が壊れないように数字以外は捨ててからゼロ埋めする。
	const digits = (issue ?? "").replace(/\D+/g, "");
	const padded = (digits || "1").padStart(3, "0").slice(-3);
	return `note-ogp_${safeTitle}_vol${padded}.png`;
}

/**
 * 1280×670 のテンプレ DOM をそのまま PNG として書き出す。
 *
 * Stage で `transform: scale()` をかけて縮小表示しているため、書き出し前に
 * 一時的に等倍に戻す。`document.fonts.ready` を待ってから html-to-image を
 * 呼ぶことで Google Fonts が確実に当たった状態の PNG が得られる。
 */
export async function downloadPng(
	node: HTMLDivElement,
	fileName: string,
): Promise<void> {
	if (document.fonts?.ready) {
		await document.fonts.ready;
	}
	const parent = node.parentElement;
	if (!parent) {
		throw new Error("書き出し対象の親要素が見つかりません");
	}
	const prev = {
		nodeTransform: node.style.transform,
		parentWidth: parent.style.width,
		parentHeight: parent.style.height,
	};
	node.style.transform = "none";
	parent.style.width = `${OGP_W}px`;
	parent.style.height = `${OGP_H}px`;
	try {
		const dataUrl = await toPng(node, {
			width: OGP_W,
			height: OGP_H,
			pixelRatio: 2,
			cacheBust: true,
			skipFonts: false,
			style: { transform: "none" },
		});
		const a = document.createElement("a");
		a.download = fileName;
		a.href = dataUrl;
		a.click();
	} finally {
		node.style.transform = prev.nodeTransform;
		parent.style.width = prev.parentWidth;
		parent.style.height = prev.parentHeight;
	}
}
