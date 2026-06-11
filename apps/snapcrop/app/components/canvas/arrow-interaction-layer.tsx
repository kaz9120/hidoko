import type React from "react";
import { useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import type { UseArrowEngineResult } from "~/hooks/use-arrow-engine";
import { type ArrowAnnotation, hitTestArrow } from "~/lib/arrow-engine";

type Props = {
	engine: UseArrowEngineResult;
	arrows: readonly ArrowAnnotation[];
	zoom: number;
	getImagePoint: (
		clientX: number,
		clientY: number,
	) => { x: number; y: number } | null;
};

/**
 * 矢印ツール選択中だけ stage を覆う透明な hit layer。pointerdown で線分への
 * 距離ベースの hit test を行い、既存矢印があれば選択 + 移動開始、なければ
 * 選択解除 + 描画開始。rect-interaction-layer.tsx の先例どおり、座標変換は
 * 親 (image-stage) から `getImagePoint` を受け取る。hit の許容距離は
 * zoom が小さいほど画像 px で広げ、画面上で常に掴みやすくする。
 */
export function ArrowInteractionLayer({
	engine,
	arrows,
	zoom,
	getImagePoint,
}: Props) {
	const { selectAnnotation, spacePressedRef } = useSnapcrop();
	const dragRef = useRef<{ pointerId: number } | null>(null);

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		const pt = getImagePoint(e.clientX, e.clientY);
		if (!pt) return;
		e.preventDefault();
		// 画面上で約 8px を画像座標に換算した許容距離 (細い線でも掴める)
		const hit = hitTestArrow(arrows, pt.x, pt.y, 8 / zoom);
		if (hit) {
			dragRef.current = { pointerId: e.pointerId };
			e.currentTarget.setPointerCapture(e.pointerId);
			selectAnnotation(hit.id);
			engine.beginMove(hit.id, pt);
			return;
		}
		// 空クリック: 選択解除 + 描画開始 (ただし Space 押下中は描画しない)
		selectAnnotation(null);
		if (spacePressedRef.current) return;
		dragRef.current = { pointerId: e.pointerId };
		e.currentTarget.setPointerCapture(e.pointerId);
		engine.beginDraw(pt, e.shiftKey);
	};

	const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const d = dragRef.current;
		if (!d || d.pointerId !== e.pointerId) return;
		const pt = getImagePoint(e.clientX, e.clientY);
		if (!pt) return;
		// shiftKey で拘束 (45° 刻みの角度スナップ)。途中の押下・解放にも追従する
		engine.updateInteraction(pt, e.shiftKey);
	};

	const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
		const d = dragRef.current;
		if (!d || d.pointerId !== e.pointerId) return;
		dragRef.current = null;
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			// already released
		}
		engine.endInteraction();
	};

	return (
		<div
			className="absolute inset-0"
			onPointerCancel={onPointerUp}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			style={{
				cursor: "crosshair",
				touchAction: "none",
			}}
		/>
	);
}
