import type React from "react";
import { useRef } from "react";
import type { UseRectEngineResult } from "~/hooks/use-rect-engine";
import type { RectAnnotation, ResizeHandle } from "~/lib/rect-engine";

const HANDLES: ReadonlyArray<ResizeHandle> = [
	"n",
	"ne",
	"e",
	"se",
	"s",
	"sw",
	"w",
	"nw",
];

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
	n: "ns-resize",
	s: "ns-resize",
	e: "ew-resize",
	w: "ew-resize",
	ne: "nesw-resize",
	sw: "nesw-resize",
	nw: "nwse-resize",
	se: "nwse-resize",
};

const HANDLE_POS: Record<ResizeHandle, React.CSSProperties> = {
	n: { top: -4, left: "50%", marginLeft: -4 },
	s: { bottom: -4, left: "50%", marginLeft: -4 },
	e: { right: -4, top: "50%", marginTop: -4 },
	w: { left: -4, top: "50%", marginTop: -4 },
	ne: { top: -4, right: -4 },
	nw: { top: -4, left: -4 },
	se: { bottom: -4, right: -4 },
	sw: { bottom: -4, left: -4 },
};

type Props = {
	annotation: RectAnnotation;
	zoom: number;
	engine: UseRectEngineResult;
	getImagePoint: (
		clientX: number,
		clientY: number,
	) => { x: number; y: number } | null;
};

/**
 * 選択中の矩形に重ねる 1px ember ring と 8 つのリサイズハンドル。ハンドルだけが
 * pointer-events を受け、本体 (ring の内側) は下のレイヤー (= RectInteractionLayer)
 * へ click を流して move 開始に繋げる。
 */
export function RectSelectionOverlay({
	annotation,
	zoom,
	engine,
	getImagePoint,
}: Props) {
	const dragRef = useRef<{ pointerId: number; handle: ResizeHandle } | null>(
		null,
	);

	const onHandleDown = (
		e: React.PointerEvent<HTMLDivElement>,
		h: ResizeHandle,
	) => {
		if (e.button !== 0) return;
		const pt = getImagePoint(e.clientX, e.clientY);
		if (!pt) return;
		e.preventDefault();
		e.stopPropagation();
		dragRef.current = { pointerId: e.pointerId, handle: h };
		e.currentTarget.setPointerCapture(e.pointerId);
		engine.beginResize(annotation.id, h, pt);
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

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute"
			style={{
				left: annotation.x * zoom,
				top: annotation.y * zoom,
				width: annotation.width * zoom,
				height: annotation.height * zoom,
			}}
		>
			{/* selection ring — 1px ember-400 */}
			<div className="pointer-events-none absolute inset-0 border border-[var(--ember-400)]" />
			{HANDLES.map((h) => (
				<div
					className="pointer-events-auto absolute size-2 rounded-[1px] border-[1.5px] border-[#1a0d05] bg-[var(--ember-400)]"
					key={h}
					onPointerCancel={onHandleUp}
					onPointerDown={(e) => onHandleDown(e, h)}
					onPointerMove={onHandleMove}
					onPointerUp={onHandleUp}
					style={{
						...HANDLE_POS[h],
						cursor: HANDLE_CURSORS[h],
						touchAction: "none",
					}}
				/>
			))}
		</div>
	);
}
