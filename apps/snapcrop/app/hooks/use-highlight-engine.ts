import { useCallback, useMemo, useRef, useState } from "react";
import {
	type HighlightEngineHandle,
	useSnapcrop,
} from "~/contexts/snapcrop-context";
import { useShiftConstrainKey } from "~/hooks/use-shift-constrain-key";
import { constrainToAxis } from "~/lib/constrain";
import {
	clampPointInImage,
	cloneHighlightAnnotation,
	createHighlightAnnotation,
	duplicateHighlightAnnotation,
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
 * constrain は Shift 押下中の拘束 (drawing = 水平 / 垂直への吸着)。
 */
type Interaction =
	| {
			kind: "drawing";
			startImg: ImagePoint;
			currentImg: ImagePoint;
			constrain: boolean;
	  }
	| {
			kind: "moving";
			id: string;
			startImg: ImagePoint;
			startHighlight: HighlightAnnotation;
			currentImg: ImagePoint;
			constrain: boolean;
	  }
	| {
			kind: "endpoint";
			id: string;
			endpoint: HighlightEndpoint;
			startImg: ImagePoint;
			startHighlight: HighlightAnnotation;
			currentImg: ImagePoint;
			constrain: boolean;
	  }
	| {
			kind: "duplicating";
			/** 元と同位置に採番済みのコピー。pointerup まで context には入れない */
			copy: HighlightAnnotation;
			startImg: ImagePoint;
			currentImg: ImagePoint;
			constrain: boolean;
	  };

/** drawing 中の実効 current 点。Shift 拘束中は優勢な軸 (水平 / 垂直) へ吸着する。 */
function resolveDrawCurrent(i: {
	startImg: ImagePoint;
	currentImg: ImagePoint;
	constrain: boolean;
}): ImagePoint {
	return i.constrain ? constrainToAxis(i.startImg, i.currentImg) : i.currentImg;
}

/**
 * endpoint ドラッグ中の実効 delta。Shift 拘束中は反対端を固定して動かす端点を
 * 優勢軸 (水平 / 垂直) に吸着させ、その結果から元端点座標との差分を返す。
 */
function resolveEndpointDelta(i: {
	endpoint: HighlightEndpoint;
	startHighlight: HighlightAnnotation;
	startImg: ImagePoint;
	currentImg: ImagePoint;
	constrain: boolean;
}): { dx: number; dy: number } {
	const dx = i.currentImg.x - i.startImg.x;
	const dy = i.currentImg.y - i.startImg.y;
	if (!i.constrain) return { dx, dy };
	const origin =
		i.endpoint === "start"
			? { x: i.startHighlight.x1, y: i.startHighlight.y1 }
			: { x: i.startHighlight.x2, y: i.startHighlight.y2 };
	const fixed =
		i.endpoint === "start"
			? { x: i.startHighlight.x2, y: i.startHighlight.y2 }
			: { x: i.startHighlight.x1, y: i.startHighlight.y1 };
	const snapped = constrainToAxis(fixed, {
		x: origin.x + dx,
		y: origin.y + dy,
	});
	return { dx: snapped.x - origin.x, dy: snapped.y - origin.y };
}

export type UseHighlightEngineResult = {
	/** 表示用 highlight 配列。interaction 中はそのハイライトだけ delta 反映済 */
	renderedHighlights: readonly HighlightAnnotation[];
	/** 描画中の preview 線分 (= まだ commit されていない) */
	previewHighlight: { x1: number; y1: number; x2: number; y2: number } | null;
	/** drawing / moving / endpoint いずれか進行中か */
	isInteracting: boolean;
	beginDraw: (startImg: ImagePoint, constrain?: boolean) => void;
	beginMove: (id: string, startImg: ImagePoint) => void;
	/**
	 * Alt+ドラッグ複製を開始する。source のコピーをその場に作り、以後の
	 * ドラッグはコピー側を動かす (元は動かない)。endInteraction で初めて
	 * コピーを context に commit するので、複製は undo 1 回で取り消せる。
	 */
	beginDuplicate: (source: HighlightAnnotation, startImg: ImagePoint) => void;
	beginEndpointDrag: (
		id: string,
		endpoint: HighlightEndpoint,
		startImg: ImagePoint,
	) => void;
	updateInteraction: (currentImg: ImagePoint, constrain?: boolean) => void;
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

	const beginDraw = useCallback((startImg: ImagePoint, constrain = false) => {
		setInteraction({
			kind: "drawing",
			startImg,
			currentImg: startImg,
			constrain,
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
				constrain: false,
			});
		},
		[highlights],
	);

	const beginDuplicate = useCallback(
		(source: HighlightAnnotation, startImg: ImagePoint) => {
			setInteraction({
				kind: "duplicating",
				copy: cloneHighlightAnnotation(source),
				startImg,
				currentImg: startImg,
				constrain: false,
			});
		},
		[],
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
				constrain: false,
			});
		},
		[highlights],
	);

	const updateInteraction = useCallback(
		(currentImg: ImagePoint, constrain = false) => {
			setInteraction((prev) =>
				prev ? { ...prev, currentImg, constrain } : null,
			);
		},
		[],
	);

	// ポインタ静止中の Shift 押下・解放にも追従する (pointermove 由来の更新は
	// updateInteraction が担う)。
	const setConstrain = useCallback((constrain: boolean) => {
		setInteraction((prev) =>
			prev && prev.constrain !== constrain ? { ...prev, constrain } : prev,
		);
	}, []);
	useShiftConstrainKey(interaction !== null, setConstrain);

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
			const p2 = clampPointInImage(resolveDrawCurrent(prev), img);
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
		} else if (prev.kind === "duplicating") {
			const dx = prev.currentImg.x - prev.startImg.x;
			const dy = prev.currentImg.y - prev.startImg.y;
			// 動かさず放したときは元と完全に重なって気づけないため、⌘D と同じ
			// オフセット配置にフォールバックする
			createHighlight(
				dx === 0 && dy === 0
					? duplicateHighlightAnnotation(prev.copy, img)
					: moveHighlight(prev.copy, { dx, dy }, img),
			);
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
			const next = moveHighlightEndpoint(
				prev.startHighlight,
				prev.endpoint,
				resolveEndpointDelta(prev),
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
		if (interaction.kind === "duplicating") {
			// commit 前のコピーを末尾 (= 同種内で最前面) に足して見せる
			return [...highlights, moveHighlight(interaction.copy, { dx, dy }, img)];
		}
		return highlights.map((h) => {
			if (h.id !== interaction.id) return h;
			if (interaction.kind === "moving") {
				return moveHighlight(interaction.startHighlight, { dx, dy }, img);
			}
			return moveHighlightEndpoint(
				interaction.startHighlight,
				interaction.endpoint,
				resolveEndpointDelta(interaction),
				img,
			);
		});
	}, [highlights, interaction]);

	const previewHighlight = useMemo(() => {
		if (interaction?.kind !== "drawing") return null;
		const img = imageRef.current;
		const p1 = clampPointInImage(interaction.startImg, img);
		const p2 = clampPointInImage(resolveDrawCurrent(interaction), img);
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
		beginDuplicate,
		beginEndpointDrag,
		updateInteraction,
		endInteraction,
		cancelInteraction,
		handle,
	};
}
