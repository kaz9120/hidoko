import type React from "react";
import { useRef } from "react";
import type { UseArrowEngineResult } from "~/hooks/use-arrow-engine";
import {
	ARROW_STROKE_PX,
	type ArrowAnnotation,
	type ArrowEndpoint,
	arrowControlPoint,
} from "~/lib/arrow-engine";

type Props = {
	arrow: ArrowAnnotation;
	zoom: number;
	engine: UseArrowEngineResult;
	imageWidth: number;
	imageHeight: number;
	getImagePoint: (
		clientX: number,
		clientY: number,
	) => { x: number; y: number } | null;
};

/**
 * 選択中の矢印に重ねる ember ハロー (線に沿った半透明の太線) と、始点・終点の
 * 2 つの端点ハンドル。rect-selection-overlay.tsx の 8 ハンドルの矢印版で、
 * ハンドルだけが pointer-events を受け、線上のクリックは下のレイヤー
 * (= ArrowInteractionLayer) へ流して move 開始に繋げる。
 */
export function ArrowSelectionOverlay({
	arrow,
	zoom,
	engine,
	imageWidth,
	imageHeight,
	getImagePoint,
}: Props) {
	const dragRef = useRef<{
		pointerId: number;
		endpoint: ArrowEndpoint;
	} | null>(null);

	const onHandleDown = (
		e: React.PointerEvent<HTMLDivElement>,
		endpoint: ArrowEndpoint,
	) => {
		if (e.button !== 0) return;
		const pt = getImagePoint(e.clientX, e.clientY);
		if (!pt) return;
		e.preventDefault();
		e.stopPropagation();
		dragRef.current = { pointerId: e.pointerId, endpoint };
		e.currentTarget.setPointerCapture(e.pointerId);
		engine.beginEndpointDrag(arrow.id, endpoint, pt);
	};

	const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const d = dragRef.current;
		if (!d || d.pointerId !== e.pointerId) return;
		const pt = getImagePoint(e.clientX, e.clientY);
		if (!pt) return;
		engine.updateInteraction(pt);
	};

	const onHandleUp = (e: React.PointerEvent<HTMLDivElement>) => {
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

	const control = arrowControlPoint(arrow);
	const d = control
		? `M ${arrow.x1} ${arrow.y1} Q ${control.x} ${control.y} ${arrow.x2} ${arrow.y2}`
		: `M ${arrow.x1} ${arrow.y1} L ${arrow.x2} ${arrow.y2}`;
	const endpoints: ReadonlyArray<{
		endpoint: ArrowEndpoint;
		x: number;
		y: number;
	}> = [
		{ endpoint: "start", x: arrow.x1, y: arrow.y1 },
		{ endpoint: "end", x: arrow.x2, y: arrow.y2 },
	];

	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0">
			{/* selection halo — 線に沿った ember-400 の半透明太線 (画面上で +6px) */}
			<svg
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 size-full"
				preserveAspectRatio="none"
				viewBox={`0 0 ${imageWidth} ${imageHeight}`}
			>
				<path
					d={d}
					fill="none"
					stroke="var(--ember-400)"
					strokeLinecap="round"
					strokeOpacity={0.4}
					strokeWidth={ARROW_STROKE_PX[arrow.thickness] + 6 / zoom}
				/>
			</svg>
			{/* 端点ハンドル — rect の 12px ハンドルと同サイズ・同色。丸で「端点」を示す */}
			{endpoints.map(({ endpoint, x, y }) => (
				<div
					className="pointer-events-auto absolute size-3 rounded-full border-[1.5px] border-[#1a0d05] bg-[var(--ember-400)] shadow-sm"
					key={endpoint}
					onPointerCancel={onHandleUp}
					onPointerDown={(e) => onHandleDown(e, endpoint)}
					onPointerMove={onHandleMove}
					onPointerUp={onHandleUp}
					style={{
						left: x * zoom - 6,
						top: y * zoom - 6,
						cursor: "move",
						touchAction: "none",
					}}
				/>
			))}
		</div>
	);
}
