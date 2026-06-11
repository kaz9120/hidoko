import { useLayoutEffect, useRef, useState } from "react";
import type { CropRect } from "~/hooks/use-crop-engine";

/** 枠と HUD の間隔 (CSS px)。 */
const GAP = 8;

export type DimensionHudProps = {
	/** 選択範囲 (画像座標 px)。表示する W × H もこの値 (= 元画像の実ピクセル)。 */
	rect: CropRect;
	zoom: number;
	/** stage の境界計算に使う元画像サイズ (px)。 */
	imageWidth: number;
	imageHeight: number;
};

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * クロップ選択枠に追従する寸法 HUD。`W × H` を元画像の実ピクセル値で表示する。
 * stage は CSS transform ではなく座標乗算で zoom を適用しているため、文字サイズは
 * ズーム倍率に関係なく一定。
 *
 * 配置は「枠の下 → 枠の上 → 枠の内側下」の順で、stage からはみ出さない場所に
 * 退避する。stage 外に置くと scroller の overflow が伸びてスクロールがチラつく
 * (crop-frame.tsx の過去コメント参照) ため、必ず stage 境界内に clamp する。
 */
export function DimensionHud({
	rect,
	zoom,
	imageWidth,
	imageHeight,
}: DimensionHudProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [hud, setHud] = useState({ w: 0, h: 0 });

	const label = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;

	// 配置計算に実寸が要るので、描画後 (paint 前) に自身のサイズを測る。
	// label の桁数が変わったときだけ再計測すれば足りる。
	// biome-ignore lint/correctness/useExhaustiveDependencies: label 変化で再計測
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const w = el.offsetWidth;
		const h = el.offsetHeight;
		setHud((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
	}, [label]);

	const view = {
		x: rect.x * zoom,
		y: rect.y * zoom,
		w: rect.width * zoom,
		h: rect.height * zoom,
	};
	const stageW = imageWidth * zoom;
	const stageH = imageHeight * zoom;

	let top: number;
	if (view.y + view.h + GAP + hud.h <= stageH) {
		// 基本形: 枠の下端の外側
		top = view.y + view.h + GAP;
	} else if (view.y - GAP - hud.h >= 0) {
		// 下に置けない: 枠の上側へ退避
		top = view.y - GAP - hud.h;
	} else {
		// 上下とも置けない (枠が縦いっぱい): 枠の内側下へ退避
		top = Math.max(0, view.y + view.h - GAP - hud.h);
	}
	const left = clamp(
		view.x + view.w / 2 - hud.w / 2,
		0,
		Math.max(0, stageW - hud.w),
	);

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute select-none whitespace-nowrap rounded-[4px] border border-[var(--ember-400)]/40 bg-[#1a0d05]/85 px-1.5 py-0.5 font-mono text-[11px] text-[var(--ember-100)] tabular-nums shadow-sm"
			ref={ref}
			style={{ left, top }}
		>
			{label}
		</div>
	);
}
