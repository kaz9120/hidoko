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

// 12px ハンドル + 中心オフセット -6。CropFrame と同サイズ・同色で揃える。
const HANDLE_POS: Record<ResizeHandle, React.CSSProperties> = {
	n: { top: -6, left: "50%", marginLeft: -6 },
	s: { bottom: -6, left: "50%", marginLeft: -6 },
	e: { right: -6, top: "50%", marginTop: -6 },
	w: { left: -6, top: "50%", marginTop: -6 },
	ne: { top: -6, right: -6 },
	nw: { top: -6, left: -6 },
	se: { bottom: -6, right: -6 },
	sw: { bottom: -6, left: -6 },
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
 * pointer-events を受け、本体 (ring の内側) は下のレイヤー (= AnnotationInteractionLayer)
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
		engine.beginResize(annotation.id, h, pt, e.shiftKey);
	};

	const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const d = dragRef.current;
		if (!d || d.pointerId !== e.pointerId) return;
		const pt = getImagePoint(e.clientX, e.clientY);
		if (!pt) return;
		// shiftKey で拘束 (アスペクト比維持)。途中の押下・解放にも追従する
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
			{/* selection ring — 1px ember-400 + dark shadow (写真上の視認性) */}
			<div className="pointer-events-none absolute inset-0 border border-[var(--ember-400)] shadow-[0_0_0_1px_rgba(0,0,0,0.45)]" />
			{HANDLES.map((h) => (
				<div
					className="pointer-events-auto absolute size-3 rounded-[2px] border-[1.5px] border-[#1a0d05] bg-[var(--ember-400)] shadow-sm"
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
