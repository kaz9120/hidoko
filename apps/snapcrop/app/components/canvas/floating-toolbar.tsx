import type { ReactNode } from "react";

/**
 * 選択中の図形に貼り付くフローティングツールバー (確定仕様 Phase 3 / Issue #147)。
 * snapcrop 新デザイン最終版の FinalSelectionCatalog で、2 段目ツールバーが
 * 抱えていた「都度の調整」をこちらに引き取る役目。本 PR ではまず基盤と、
 * 矩形・マーカー・モザイク用の最小コンテンツ (太さ + 削除) を入れる。
 *
 * 位置決め:
 *   - 図形の bbox 上辺アンカー・左揃え
 *   - 画面上端に余白が足りないときは下辺へ反転
 * 表示制御:
 *   - ドラッグ中は親が visible=false を渡して隠す
 *   - 選択がないときも親が描画しない (条件付きレンダリング)
 */
export type FloatingToolbarBBox = {
	/** 画像座標系での bbox 左上 / 右下 */
	x: number;
	y: number;
	width: number;
	height: number;
};

export function FloatingToolbar({
	visible,
	bbox,
	imageWidth,
	imageHeight,
	zoom,
	children,
}: {
	visible: boolean;
	bbox: FloatingToolbarBBox;
	imageWidth: number;
	imageHeight: number;
	zoom: number;
	children: ReactNode;
}) {
	if (!visible) return null;

	// bbox 上辺アンカー・左揃え (確定仕様 FinalSelectionCatalog)。
	// 画面上に余白が無さそうなら下辺に反転する: zoom 後の画素換算で 56px (バー高 38 + 余白)
	// 確保できないなら下辺へ。
	const ARM = 12; // バーと bbox の隙間 (px、画面座標)
	const GAP_PX = 56;
	const flip = bbox.y * zoom < GAP_PX;
	// 親 (selection overlay 内) の絶対座標系は「画像座標系を zoom 倍した画素」。
	// AnnotationLayer などと同じく left/top を画像座標で書ける環境を前提とする。
	const left = `${(bbox.x / imageWidth) * 100}%`;
	const topAnchor = flip
		? `${((bbox.y + bbox.height) / imageHeight) * 100}%`
		: `${(bbox.y / imageHeight) * 100}%`;

	return (
		<div
			role="toolbar"
			aria-label="選択中のプロパティ"
			className="pointer-events-auto absolute z-10 inline-flex translate-x-0 items-center gap-1.5 rounded-md border border-border bg-[rgba(26,24,20,0.96)] px-2 py-1.5 text-(--text) shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,240,220,0.04)] backdrop-blur"
			style={{
				left,
				top: topAnchor,
				transform: flip
					? `translateY(${ARM}px)`
					: `translateY(calc(-100% - ${ARM}px))`,
			}}
		>
			{children}
		</div>
	);
}
