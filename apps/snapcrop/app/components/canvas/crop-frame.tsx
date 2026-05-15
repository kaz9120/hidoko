import type React from "react";
import { useRef } from "react";
import type { UseCropEngineResult } from "~/hooks/use-crop-engine";
import type { ResizeHandle } from "~/lib/crop-engine";

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

// 14px のハンドルを枠線をまたぐように配置。視認性のため見た目は 14px、
// pointer の hit area は touchAction:none と相まってちょうど良いサイズになる。
const HANDLE_POS: Record<ResizeHandle, React.CSSProperties> = {
	n: { top: -7, left: "50%", marginLeft: -7 },
	s: { bottom: -7, left: "50%", marginLeft: -7 },
	e: { right: -7, top: "50%", marginTop: -7 },
	w: { left: -7, top: "50%", marginTop: -7 },
	ne: { top: -7, right: -7 },
	nw: { top: -7, left: -7 },
	se: { bottom: -7, right: -7 },
	sw: { bottom: -7, left: -7 },
};

export type CropFrameProps = {
	engine: UseCropEngineResult;
	zoom: number;
};

/**
 * クロップ枠 UI。8 ハンドル + 内側ドラッグで rect を編集し、外側を 4 分割 div
 * で dim する。サイズ表示は header / status-bar に出ているのでここには置かない
 * (枠下に置くと画像端の rect で stage がはみ出してスクロールがチラつくため)。
 *
 * 画像座標 → stage 座標は `× zoom`、pointer delta (CSS px) は `/ zoom` で
 * 画像座標に戻して engine に渡す。
 */
export function CropFrame({ engine, zoom }: CropFrameProps) {
	const {
		cropRect,
		beginMove,
		beginResize,
		updateInteraction,
		endInteraction,
	} = engine;
	const dragRef = useRef<{
		pointerId: number;
		startX: number;
		startY: number;
	} | null>(null);

	if (!cropRect) return null;

	const view = {
		x: cropRect.x * zoom,
		y: cropRect.y * zoom,
		w: cropRect.width * zoom,
		h: cropRect.height * zoom,
	};

	const startDrag = (
		e: React.PointerEvent<HTMLElement>,
		kind: "move" | { resize: ResizeHandle },
	) => {
		// 左クリックのみ。右クリックは viewport の pan に流す。
		if (e.button !== 0) return;
		e.preventDefault();
		e.stopPropagation();
		dragRef.current = {
			pointerId: e.pointerId,
			startX: e.clientX,
			startY: e.clientY,
		};
		e.currentTarget.setPointerCapture(e.pointerId);
		if (kind === "move") {
			beginMove();
		} else {
			beginResize(kind.resize);
		}
	};

	const continueDrag = (e: React.PointerEvent<HTMLElement>) => {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== e.pointerId) return;
		const dx = (e.clientX - drag.startX) / zoom;
		const dy = (e.clientY - drag.startY) / zoom;
		updateInteraction({ dx, dy });
	};

	const endDrag = (e: React.PointerEvent<HTMLElement>) => {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== e.pointerId) return;
		dragRef.current = null;
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			// already released
		}
		endInteraction();
	};

	return (
		<>
			<Dim view={view} />
			<div
				className="absolute border border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.55)]"
				onPointerCancel={endDrag}
				onPointerDown={(e) => startDrag(e, "move")}
				onPointerMove={continueDrag}
				onPointerUp={endDrag}
				style={{
					left: view.x,
					top: view.y,
					width: view.w,
					height: view.h,
					cursor: "move",
					touchAction: "none",
				}}
			>
				{HANDLES.map((h) => (
					<div
						aria-hidden="true"
						className="absolute size-3.5 rounded-full border-2 border-background bg-primary shadow-sm"
						key={h}
						onPointerCancel={endDrag}
						onPointerDown={(e) => startDrag(e, { resize: h })}
						onPointerMove={continueDrag}
						onPointerUp={endDrag}
						style={{
							...HANDLE_POS[h],
							cursor: HANDLE_CURSORS[h],
							touchAction: "none",
						}}
					/>
				))}
			</div>
		</>
	);
}

function Dim({
	view,
}: {
	view: { x: number; y: number; w: number; h: number };
}) {
	const cls = "pointer-events-none absolute bg-black/55";
	return (
		<>
			<div
				className={cls}
				style={{ left: 0, top: 0, right: 0, height: view.y }}
			/>
			<div
				className={cls}
				style={{ left: 0, top: view.y, width: view.x, height: view.h }}
			/>
			<div
				className={cls}
				style={{
					left: view.x + view.w,
					top: view.y,
					right: 0,
					height: view.h,
				}}
			/>
			<div
				className={cls}
				style={{ left: 0, top: view.y + view.h, right: 0, bottom: 0 }}
			/>
		</>
	);
}
