import type React from "react";
import { useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import type { UseRectEngineResult } from "~/hooks/use-rect-engine";
import { hitTest, type RectAnnotation } from "~/lib/rect-engine";

type Props = {
	engine: UseRectEngineResult;
	annotations: readonly RectAnnotation[];
	getImagePoint: (clientX: number, clientY: number) => { x: number; y: number };
};

/**
 * 矩形ツール選択中だけ stage を覆う透明な hit layer。pointerdown で hit test を
 * 行い、既存矩形があれば選択 + 移動開始、なければ選択解除 + 描画開始。
 * 座標変換は親 (image-stage) から `getImagePoint` を受け取る — 親で画像要素を
 * 起点に算出することで、interaction-layer と selection overlay の handle で
 * 同じ基準座標を共有できる。
 */
export function RectInteractionLayer({
	engine,
	annotations,
	getImagePoint,
}: Props) {
	const { selectAnnotation, spacePressedRef } = useSnapcrop();
	const dragRef = useRef<{ pointerId: number } | null>(null);

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		e.preventDefault();
		const pt = getImagePoint(e.clientX, e.clientY);
		const hit = hitTest(annotations, pt.x, pt.y);
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
		engine.beginDraw(pt);
	};

	const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const d = dragRef.current;
		if (!d || d.pointerId !== e.pointerId) return;
		engine.updateInteraction(getImagePoint(e.clientX, e.clientY));
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
