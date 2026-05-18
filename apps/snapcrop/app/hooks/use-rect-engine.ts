import { useCallback, useMemo, useRef, useState } from "react";
import {
	type RectEngineHandle,
	useSnapcrop,
} from "~/contexts/snapcrop-context";
import {
	createRectAnnotation,
	type ImageMetrics,
	MIN_RECT_SIZE,
	moveAnnotation,
	normalizeDrawingRect,
	type RectAnnotation,
	type ResizeHandle,
	resizeAnnotation,
} from "~/lib/rect-engine";

type ImagePoint = { x: number; y: number };

/**
 * 進行中の操作。kind に応じて drawing / moving / resizing を表現する。
 * delta は image 座標系の差分 (= currentImgPt - startImgPt)。
 */
type Interaction =
	| { kind: "drawing"; startImg: ImagePoint; currentImg: ImagePoint }
	| {
			kind: "moving";
			id: string;
			startImg: ImagePoint;
			startRect: RectAnnotation;
			currentImg: ImagePoint;
	  }
	| {
			kind: "resizing";
			id: string;
			handle: ResizeHandle;
			startImg: ImagePoint;
			startRect: RectAnnotation;
			currentImg: ImagePoint;
	  };

export type UseRectEngineResult = {
	/** 表示用 annotation 配列。interaction 中はその rect だけ delta 反映済 */
	renderedAnnotations: readonly RectAnnotation[];
	/** 描画中の preview rect (= まだ commit されていない) */
	previewRect: { x: number; y: number; width: number; height: number } | null;
	/** drawing / moving / resizing いずれか進行中か */
	isInteracting: boolean;
	beginDraw: (startImg: ImagePoint) => void;
	beginMove: (id: string, startImg: ImagePoint) => void;
	beginResize: (id: string, handle: ResizeHandle, startImg: ImagePoint) => void;
	updateInteraction: (currentImg: ImagePoint) => void;
	endInteraction: () => void;
	cancelInteraction: () => void;
	/** context にぶら下げる用の安定ハンドル。useEffect で ref へ差し込む */
	handle: RectEngineHandle;
};

/**
 * 矩形アノテーションの interaction 状態を管理。crop-engine 同様、ドラッグ中の
 * 中間状態は React state には持たず ref + 局所 state で扱い、endInteraction で
 * 初めて context (= 履歴) に commit する。
 */
export function useRectEngine(image: ImageMetrics): UseRectEngineResult {
	const { annotations, rectDefaults, createAnnotation, updateAnnotation } =
		useSnapcrop();

	// interaction は表示にも使うので state で持つ (毎回 re-render する)。
	// ただし副作用 (createAnnotation / updateAnnotation) を setState updater 内で
	// 走らせると StrictMode で二重実行されうるため、最新値は interactionRef で
	// 別途追っておき、endInteraction では ref を読んでから setInteraction(null) する。
	const [interaction, setInteraction] = useState<Interaction | null>(null);
	const interactionRef = useRef<Interaction | null>(null);
	interactionRef.current = interaction;

	const imageRef = useRef(image);
	imageRef.current = image;
	const rectDefaultsRef = useRef(rectDefaults);
	rectDefaultsRef.current = rectDefaults;

	const beginDraw = useCallback((startImg: ImagePoint) => {
		setInteraction({
			kind: "drawing",
			startImg,
			currentImg: startImg,
		});
	}, []);

	const beginMove = useCallback(
		(id: string, startImg: ImagePoint) => {
			const target = annotations.find((a) => a.id === id);
			if (!target) return;
			setInteraction({
				kind: "moving",
				id,
				startImg,
				startRect: target,
				currentImg: startImg,
			});
		},
		[annotations],
	);

	const beginResize = useCallback(
		(id: string, handle: ResizeHandle, startImg: ImagePoint) => {
			const target = annotations.find((a) => a.id === id);
			if (!target) return;
			setInteraction({
				kind: "resizing",
				id,
				handle,
				startImg,
				startRect: target,
				currentImg: startImg,
			});
		},
		[annotations],
	);

	const updateInteraction = useCallback((currentImg: ImagePoint) => {
		setInteraction((prev) => (prev ? { ...prev, currentImg } : null));
	}, []);

	const cancelInteraction = useCallback(() => {
		setInteraction(null);
	}, []);

	const endInteraction = useCallback(() => {
		const prev = interactionRef.current;
		if (!prev) return;
		const img = imageRef.current;
		// 副作用を setState の外で先に処理してから state クリア
		if (prev.kind === "drawing") {
			const rect = normalizeDrawingRect(prev.startImg, prev.currentImg, img);
			if (rect.width >= MIN_RECT_SIZE && rect.height >= MIN_RECT_SIZE) {
				const annotation = createRectAnnotation({
					...rect,
					defaults: rectDefaultsRef.current,
				});
				createAnnotation(annotation);
			}
		} else if (prev.kind === "moving") {
			const dx = prev.currentImg.x - prev.startImg.x;
			const dy = prev.currentImg.y - prev.startImg.y;
			const next = moveAnnotation(prev.startRect, { dx, dy }, img);
			updateAnnotation(prev.id, {
				x: next.x,
				y: next.y,
				width: next.width,
				height: next.height,
			});
		} else {
			const dx = prev.currentImg.x - prev.startImg.x;
			const dy = prev.currentImg.y - prev.startImg.y;
			const next = resizeAnnotation(
				prev.startRect,
				prev.handle,
				{ dx, dy },
				img,
			);
			updateAnnotation(prev.id, {
				x: next.x,
				y: next.y,
				width: next.width,
				height: next.height,
			});
		}
		interactionRef.current = null;
		setInteraction(null);
	}, [createAnnotation, updateAnnotation]);

	// rendered = annotation list + interaction の delta を視覚的に反映
	const renderedAnnotations = useMemo(() => {
		if (!interaction || interaction.kind === "drawing") return annotations;
		const dx = interaction.currentImg.x - interaction.startImg.x;
		const dy = interaction.currentImg.y - interaction.startImg.y;
		const img = imageRef.current;
		return annotations.map((a) => {
			if (a.id !== interaction.id) return a;
			if (interaction.kind === "moving") {
				return moveAnnotation(interaction.startRect, { dx, dy }, img);
			}
			return resizeAnnotation(
				interaction.startRect,
				interaction.handle,
				{ dx, dy },
				img,
			);
		});
	}, [annotations, interaction]);

	const previewRect = useMemo(() => {
		if (!interaction || interaction.kind !== "drawing") return null;
		const rect = normalizeDrawingRect(
			interaction.startImg,
			interaction.currentImg,
			imageRef.current,
		);
		return rect.width > 0 && rect.height > 0 ? rect : null;
	}, [interaction]);

	// handle: 上で持っている interactionRef を参照するだけの安定関数を返す
	const handle = useMemo<RectEngineHandle>(
		() => ({
			isInteracting: () => interactionRef.current !== null,
			cancelInteraction,
		}),
		[cancelInteraction],
	);

	return {
		renderedAnnotations,
		previewRect,
		isInteracting: interaction !== null,
		beginDraw,
		beginMove,
		beginResize,
		updateInteraction,
		endInteraction,
		cancelInteraction,
		handle,
	};
}
