import {
	forwardRef,
	type ReactNode,
	useCallback,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
} from "react";

export type ViewportHandle = {
	fitToContainer: () => void;
	setActualSize: () => void;
	setZoom: (
		zoom: number,
		anchor?: { clientX: number; clientY: number } | null,
	) => void;
	getZoom: () => number;
};

export type ViewportProps = {
	image: { width: number; height: number };
	zoom: number;
	onZoomChange: (zoom: number) => void;
	children: ReactNode;
};

const MAX_ZOOM = 8;
const MIN_ZOOM_FLOOR = 0.05;
const FIT_PADDING = 16;

function computeFitZoom(
	container: { w: number; h: number },
	img: { w: number; h: number },
): number {
	const availW = Math.max(0, container.w - FIT_PADDING * 2);
	const availH = Math.max(0, container.h - FIT_PADDING * 2);
	if (availW <= 0 || availH <= 0 || img.w <= 0 || img.h <= 0) return 1;
	return Math.min(availW / img.w, availH / img.h, 1);
}

/**
 * 画像を表示する pan / zoom コンテナ。OS 標準スクロールバーを overflow:auto で
 * 出し、⌘+wheel ズーム / wheel スクロール / 右クリックドラッグ pan を提供する。
 * children は画像 stage を絶対配置で埋めるコンポーネント。
 */
export const Viewport = forwardRef<ViewportHandle, ViewportProps>(
	function Viewport({ image, zoom, onZoomChange, children }, ref) {
		const scrollerRef = useRef<HTMLDivElement>(null);
		const stageRef = useRef<HTMLDivElement>(null);
		const fitZoomRef = useRef(1);
		const wasFittedRef = useRef(true);
		const zoomRef = useRef(zoom);
		zoomRef.current = zoom;
		const onZoomChangeRef = useRef(onZoomChange);
		onZoomChangeRef.current = onZoomChange;

		const recomputeFitZoom = useCallback(() => {
			const el = scrollerRef.current;
			if (!el) return fitZoomRef.current;
			const fit = computeFitZoom(
				{ w: el.clientWidth, h: el.clientHeight },
				{ w: image.width, h: image.height },
			);
			fitZoomRef.current = fit;
			return fit;
		}, [image.width, image.height]);

		const applyZoomAt = useCallback(
			(
				nextZoomRaw: number,
				anchor: { clientX: number; clientY: number } | null,
			) => {
				const scroller = scrollerRef.current;
				const stage = stageRef.current;
				if (!scroller || !stage) return;
				const fit = fitZoomRef.current;
				const minZoom = Math.max(MIN_ZOOM_FLOOR, fit);
				const next = Math.max(minZoom, Math.min(nextZoomRaw, MAX_ZOOM));
				const prev = zoomRef.current;
				if (next === prev) return;

				const rect = scroller.getBoundingClientRect();
				const ax = anchor ? anchor.clientX - rect.left : rect.width / 2;
				const ay = anchor ? anchor.clientY - rect.top : rect.height / 2;
				// flex 中央寄せにより stage には scroller 内のオフセットが乗る。
				// 画像座標を算出するためにオフセットを差し引いてから zoom で割る。
				const offsetX = stage.offsetLeft;
				const offsetY = stage.offsetTop;
				const imgX = (scroller.scrollLeft + ax - offsetX) / prev;
				const imgY = (scroller.scrollTop + ay - offsetY) / prev;

				wasFittedRef.current = Math.abs(next - fit) < 0.0005;
				onZoomChangeRef.current(next);

				requestAnimationFrame(() => {
					const stage2 = stageRef.current;
					const scroller2 = scrollerRef.current;
					if (!stage2 || !scroller2) return;
					const newOffsetX = stage2.offsetLeft;
					const newOffsetY = stage2.offsetTop;
					scroller2.scrollLeft = imgX * next - ax + newOffsetX;
					scroller2.scrollTop = imgY * next - ay + newOffsetY;
				});
			},
			[],
		);

		// 初回 mount で fit ズームを適用
		// biome-ignore lint/correctness/useExhaustiveDependencies: mount-once fit
		useLayoutEffect(() => {
			const fit = recomputeFitZoom();
			wasFittedRef.current = true;
			onZoomChangeRef.current(fit);
		}, []);

		// コンテナサイズ変化に追従。ユーザーがズーム操作した後は zoom を保つ
		useEffect(() => {
			const el = scrollerRef.current;
			if (!el) return;
			const ro = new ResizeObserver(() => {
				const fit = recomputeFitZoom();
				if (wasFittedRef.current) {
					onZoomChangeRef.current(fit);
				}
			});
			ro.observe(el);
			return () => ro.disconnect();
		}, [recomputeFitZoom]);

		// ⌘/Ctrl + wheel でズーム、それ以外は OS 標準スクロールに任せる
		useEffect(() => {
			const el = scrollerRef.current;
			if (!el) return;
			let pendingDelta = 0;
			let rafId: number | null = null;
			let lastAnchor: { clientX: number; clientY: number } | null = null;

			const onWheel = (e: WheelEvent) => {
				if (!(e.metaKey || e.ctrlKey)) return;
				e.preventDefault();
				pendingDelta += e.deltaY;
				lastAnchor = { clientX: e.clientX, clientY: e.clientY };
				if (rafId !== null) return;
				rafId = requestAnimationFrame(() => {
					rafId = null;
					const factor = Math.exp(-pendingDelta * 0.0015);
					pendingDelta = 0;
					applyZoomAt(zoomRef.current * factor, lastAnchor);
				});
			};

			el.addEventListener("wheel", onWheel, { passive: false });
			return () => {
				el.removeEventListener("wheel", onWheel);
				if (rafId !== null) cancelAnimationFrame(rafId);
			};
		}, [applyZoomAt]);

		// 右クリックドラッグで pan
		useEffect(() => {
			const el = scrollerRef.current;
			if (!el) return;
			let panning = false;
			let activePointerId: number | null = null;
			let lastX = 0;
			let lastY = 0;

			const onContextMenu = (e: Event) => {
				e.preventDefault();
			};
			const onPointerDown = (e: PointerEvent) => {
				if (e.button !== 2) return;
				panning = true;
				activePointerId = e.pointerId;
				el.setPointerCapture(e.pointerId);
				el.style.cursor = "grabbing";
				lastX = e.clientX;
				lastY = e.clientY;
			};
			const onPointerMove = (e: PointerEvent) => {
				if (!panning || e.pointerId !== activePointerId) return;
				el.scrollLeft -= e.clientX - lastX;
				el.scrollTop -= e.clientY - lastY;
				lastX = e.clientX;
				lastY = e.clientY;
			};
			const onPointerUp = (e: PointerEvent) => {
				if (!panning || e.pointerId !== activePointerId) return;
				panning = false;
				activePointerId = null;
				try {
					el.releasePointerCapture(e.pointerId);
				} catch {
					// pointer already released
				}
				el.style.cursor = "";
			};

			el.addEventListener("contextmenu", onContextMenu);
			el.addEventListener("pointerdown", onPointerDown);
			el.addEventListener("pointermove", onPointerMove);
			el.addEventListener("pointerup", onPointerUp);
			el.addEventListener("pointercancel", onPointerUp);
			return () => {
				el.removeEventListener("contextmenu", onContextMenu);
				el.removeEventListener("pointerdown", onPointerDown);
				el.removeEventListener("pointermove", onPointerMove);
				el.removeEventListener("pointerup", onPointerUp);
				el.removeEventListener("pointercancel", onPointerUp);
			};
		}, []);

		useImperativeHandle(
			ref,
			() => ({
				fitToContainer: () => {
					const fit = recomputeFitZoom();
					wasFittedRef.current = true;
					applyZoomAt(fit, null);
				},
				setActualSize: () => {
					wasFittedRef.current = false;
					applyZoomAt(1, null);
				},
				setZoom: (z, anchor) => {
					wasFittedRef.current = false;
					applyZoomAt(z, anchor ?? null);
				},
				getZoom: () => zoomRef.current,
			}),
			[recomputeFitZoom, applyZoomAt],
		);

		return (
			<div
				className="snapcrop-viewport-scroll relative size-full overflow-auto"
				ref={scrollerRef}
			>
				<div
					className="flex min-h-full min-w-full"
					style={{
						// `safe center` で、stage が viewport より大きい時は flex-start に
						// フォールバックする。これがないと中央寄せ起点で overflow した時に
						// scrollLeft = 0 から右にしか動けず、画像左端 / 上端まで届かない。
						alignItems: "safe center",
						justifyContent: "safe center",
					}}
				>
					<div
						className="relative shrink-0"
						ref={stageRef}
						style={{
							width: image.width * zoom,
							height: image.height * zoom,
						}}
					>
						{children}
					</div>
				</div>
			</div>
		);
	},
);
