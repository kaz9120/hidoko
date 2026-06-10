import { useCallback, useMemo, useRef, useState } from "react";
import {
	type HighlightEngineHandle,
	useSnapcrop,
} from "~/contexts/snapcrop-context";
import {
	clampPointInImage,
	createHighlightAnnotation,
	type HighlightAnnotation,
	type HighlightEndpoint,
	type ImageMetrics,
	MIN_HIGHLIGHT_LENGTH,
	moveHighlight,
	moveHighlightEndpoint,
} from "~/lib/highlight-engine";

type ImagePoint = { x: number; y: number };

/**
 * 進行中の操作。kind に応じて drawing / moving / endpoint (端点ドラッグ =
 * rect の resizing 相当) を表現する。use-arrow-engine.ts と同じ構造。
 */
type Interaction =
	| { kind: "drawing"; startImg: ImagePoint; currentImg: ImagePoint }
	| {
			kind: "moving";
			id: string;
			startImg: ImagePoint;
			startHighlight: HighlightAnnotation;
			currentImg: ImagePoint;
	  }
	| {
			kind: "endpoint";
			id: string;
			endpoint: HighlightEndpoint;
			startImg: ImagePoint;
			startHighlight: HighlightAnnotation;
			currentImg: ImagePoint;
	  };

export type UseHighlightEngineResult = {
	/** 表示用 highlight 配列。interaction 中はそのハイライトだけ delta 反映済 */
	renderedHighlights: readonly HighlightAnnotation[];
	/** 描画中の preview 線分 (= まだ commit されていない) */
	previewHighlight: { x1: number; y1: number; x2: number; y2: number } | null;
	/** drawing / moving / endpoint いずれか進行中か */
	isInteracting: boolean;
	beginDraw: (startImg: ImagePoint) => void;
	beginMove: (id: string, startImg: ImagePoint) => void;
	beginEndpointDrag: (
		id: string,
		endpoint: HighlightEndpoint,
		startImg: ImagePoint,
	) => void;
	updateInteraction: (currentImg: ImagePoint) => void;
	endInteraction: () => void;
	cancelInteraction: () => void;
	/** context にぶら下げる用の安定ハンドル。useEffect で ref へ差し込む */
	handle: HighlightEngineHandle;
};

/**
 * マーカーアノテーションの interaction 状態を管理。use-arrow-engine.ts と
 * 同様、ドラッグ中の中間状態は state + ref で扱い、endInteraction で初めて
 * context (= rect / arrow と共有の単一履歴) に commit する。
 */
export function useHighlightEngine(
	image: ImageMetrics,
): UseHighlightEngineResult {
	const { highlights, highlightDefaults, createHighlight, updateHighlight } =
		useSnapcrop();

	// interaction は表示にも使うので state で持ち、副作用は endInteraction で
	// ref を読んでから処理する (StrictMode の二重実行回避。arrow 側と同じ理由)。
	const [interaction, setInteraction] = useState<Interaction | null>(null);
	const interactionRef = useRef<Interaction | null>(null);
	interactionRef.current = interaction;

	const imageRef = useRef(image);
	imageRef.current = image;
	const highlightDefaultsRef = useRef(highlightDefaults);
	highlightDefaultsRef.current = highlightDefaults;

	const beginDraw = useCallback((startImg: ImagePoint) => {
		setInteraction({
			kind: "drawing",
			startImg,
			currentImg: startImg,
		});
	}, []);

	const beginMove = useCallback(
		(id: string, startImg: ImagePoint) => {
			const target = highlights.find((h) => h.id === id);
			if (!target) return;
			setInteraction({
				kind: "moving",
				id,
				startImg,
				startHighlight: target,
				currentImg: startImg,
			});
		},
		[highlights],
	);

	const beginEndpointDrag = useCallback(
		(id: string, endpoint: HighlightEndpoint, startImg: ImagePoint) => {
			const target = highlights.find((h) => h.id === id);
			if (!target) return;
			setInteraction({
				kind: "endpoint",
				id,
				endpoint,
				startImg,
				startHighlight: target,
				currentImg: startImg,
			});
		},
		[highlights],
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
			const p1 = clampPointInImage(prev.startImg, img);
			const p2 = clampPointInImage(prev.currentImg, img);
			if (Math.hypot(p2.x - p1.x, p2.y - p1.y) >= MIN_HIGHLIGHT_LENGTH) {
				const highlight = createHighlightAnnotation({
					x1: p1.x,
					y1: p1.y,
					x2: p2.x,
					y2: p2.y,
					defaults: highlightDefaultsRef.current,
				});
				createHighlight(highlight);
			}
		} else if (prev.kind === "moving") {
			const dx = prev.currentImg.x - prev.startImg.x;
			const dy = prev.currentImg.y - prev.startImg.y;
			const next = moveHighlight(prev.startHighlight, { dx, dy }, img);
			updateHighlight(prev.id, {
				x1: next.x1,
				y1: next.y1,
				x2: next.x2,
				y2: next.y2,
			});
		} else {
			const dx = prev.currentImg.x - prev.startImg.x;
			const dy = prev.currentImg.y - prev.startImg.y;
			const next = moveHighlightEndpoint(
				prev.startHighlight,
				prev.endpoint,
				{ dx, dy },
				img,
			);
			updateHighlight(prev.id, {
				x1: next.x1,
				y1: next.y1,
				x2: next.x2,
				y2: next.y2,
			});
		}
		interactionRef.current = null;
		setInteraction(null);
	}, [createHighlight, updateHighlight]);

	// rendered = highlight list + interaction の delta を視覚的に反映
	const renderedHighlights = useMemo(() => {
		if (!interaction || interaction.kind === "drawing") return highlights;
		const dx = interaction.currentImg.x - interaction.startImg.x;
		const dy = interaction.currentImg.y - interaction.startImg.y;
		const img = imageRef.current;
		return highlights.map((h) => {
			if (h.id !== interaction.id) return h;
			if (interaction.kind === "moving") {
				return moveHighlight(interaction.startHighlight, { dx, dy }, img);
			}
			return moveHighlightEndpoint(
				interaction.startHighlight,
				interaction.endpoint,
				{ dx, dy },
				img,
			);
		});
	}, [highlights, interaction]);

	const previewHighlight = useMemo(() => {
		if (interaction?.kind !== "drawing") return null;
		const img = imageRef.current;
		const p1 = clampPointInImage(interaction.startImg, img);
		const p2 = clampPointInImage(interaction.currentImg, img);
		if (p1.x === p2.x && p1.y === p2.y) return null;
		return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
	}, [interaction]);

	// handle: 上で持っている interactionRef を参照するだけの安定関数を返す
	const handle = useMemo<HighlightEngineHandle>(
		() => ({
			isInteracting: () => interactionRef.current !== null,
			cancelInteraction,
		}),
		[cancelInteraction],
	);

	return {
		renderedHighlights,
		previewHighlight,
		isInteracting: interaction !== null,
		beginDraw,
		beginMove,
		beginEndpointDrag,
		updateInteraction,
		endInteraction,
		cancelInteraction,
		handle,
	};
}
