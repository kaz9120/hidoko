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

const HANDLE_POS: Record<ResizeHandle, React.CSSProperties> = {
	n: { top: -5, left: "50%", marginLeft: -5 },
	s: { bottom: -5, left: "50%", marginLeft: -5 },
	e: { right: -5, top: "50%", marginTop: -5 },
	w: { left: -5, top: "50%", marginTop: -5 },
	ne: { top: -5, right: -5 },
	nw: { top: -5, left: -5 },
	se: { bottom: -5, right: -5 },
	sw: { bottom: -5, left: -5 },
};

export type CropFrameProps = {
	engine: UseCropEngineResult;
	zoom: number;
};

/**
 * クロップ枠 UI。8 ハンドル + 内側ドラッグで rect を編集し、外側を 4 分割 div
 * で dim、bottom-left に現在サイズの HUD を表示する。
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
						className="absolute size-2.5 rounded-[2px] border border-foreground bg-background"
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
				<SizeHud width={cropRect.width} height={cropRect.height} />
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

function SizeHud({ width, height }: { width: number; height: number }) {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute top-full left-0 mt-2 whitespace-nowrap rounded-sm border border-border bg-card px-2 py-1 font-mono text-foreground text-xs shadow-md"
		>
			{Math.round(width)} × {Math.round(height)}
		</div>
	);
}
