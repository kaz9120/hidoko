import type React from "react";
import { useRef } from "react";
import type { UseHighlightEngineResult } from "~/hooks/use-highlight-engine";
import {
	HIGHLIGHT_BAND_PX,
	type HighlightAnnotation,
	type HighlightEndpoint,
} from "~/lib/highlight-engine";

type Props = {
	highlight: HighlightAnnotation;
	zoom: number;
	engine: UseHighlightEngineResult;
	imageWidth: number;
	imageHeight: number;
	getImagePoint: (
		clientX: number,
		clientY: number,
	) => { x: number; y: number } | null;
};

/**
 * 選択中のハイライトに重ねる ember ハロー (帯に沿った半透明の太線) と、
 * 始点・終点の 2 つの端点ハンドル。arrow-selection-overlay.tsx の先例どおり、
 * ハンドルだけが pointer-events を受け、帯上のクリックは下のレイヤー
 * (= AnnotationInteractionLayer) へ流して move 開始に繋げる。
 */
export function HighlightSelectionOverlay({
	highlight,
	zoom,
	engine,
	imageWidth,
	imageHeight,
	getImagePoint,
}: Props) {
	const dragRef = useRef<{
		pointerId: number;
		endpoint: HighlightEndpoint;
	} | null>(null);

	const onHandleDown = (
		e: React.PointerEvent<HTMLDivElement>,
		endpoint: HighlightEndpoint,
	) => {
		if (e.button !== 0) return;
		const pt = getImagePoint(e.clientX, e.clientY);
		if (!pt) return;
		e.preventDefault();
		e.stopPropagation();
		dragRef.current = { pointerId: e.pointerId, endpoint };
		e.currentTarget.setPointerCapture(e.pointerId);
		engine.beginEndpointDrag(highlight.id, endpoint, pt);
	};

	const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const d = dragRef.current;
		if (!d || d.pointerId !== e.pointerId) return;
		const pt = getImagePoint(e.clientX, e.clientY);
		if (!pt) return;
		engine.updateInteraction(pt, e.shiftKey);
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

	const endpoints: ReadonlyArray<{
		endpoint: HighlightEndpoint;
		x: number;
		y: number;
	}> = [
		{ endpoint: "start", x: highlight.x1, y: highlight.y1 },
		{ endpoint: "end", x: highlight.x2, y: highlight.y2 },
	];

	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0">
			{/* selection halo — 帯に沿った ember-400 の半透明太線 (画面上で +6px) */}
			<svg
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 size-full"
				preserveAspectRatio="none"
				viewBox={`0 0 ${imageWidth} ${imageHeight}`}
			>
				<line
					stroke="var(--ember-400)"
					strokeLinecap="butt"
					strokeOpacity={0.4}
					strokeWidth={HIGHLIGHT_BAND_PX[highlight.thickness] + 6 / zoom}
					x1={highlight.x1}
					x2={highlight.x2}
					y1={highlight.y1}
					y2={highlight.y2}
				/>
			</svg>
			{/* 端点ハンドル — arrow の 12px ハンドルと同サイズ・同色。丸で「端点」を示す */}
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
