import { useCallback, useMemo, useRef, useState } from "react";
import {
	type ArrowEngineHandle,
	useSnapcrop,
} from "~/contexts/snapcrop-context";
import { useShiftConstrainKey } from "~/hooks/use-shift-constrain-key";
import {
	type ArrowAnnotation,
	type ArrowEndpoint,
	clampPointInImage,
	createArrowAnnotation,
	type ImageMetrics,
	MIN_ARROW_LENGTH,
	moveArrow,
	moveArrowEndpoint,
	newArrowSeed,
} from "~/lib/arrow-engine";
import { constrainToAngleSnap } from "~/lib/constrain";

type ImagePoint = { x: number; y: number };

/**
 * 進行中の操作。kind に応じて drawing / moving / endpoint (端点ドラッグ =
 * rect の resizing 相当) を表現する。use-rect-engine.ts と同じ構造。
 * constrain は Shift 押下中の拘束 (drawing = 45° 刻みの角度スナップ)。
 */
type Interaction =
	| {
			kind: "drawing";
			startImg: ImagePoint;
			currentImg: ImagePoint;
			constrain: boolean;
			/** 手書き風の揺らぎ seed。プレビューと commit 後で同じ形を保つ */
			seed: number;
	  }
	| {
			kind: "moving";
			id: string;
			startImg: ImagePoint;
			startArrow: ArrowAnnotation;
			currentImg: ImagePoint;
			constrain: boolean;
	  }
	| {
			kind: "endpoint";
			id: string;
			endpoint: ArrowEndpoint;
			startImg: ImagePoint;
			startArrow: ArrowAnnotation;
			currentImg: ImagePoint;
			constrain: boolean;
	  };

/** drawing 中の実効 current 点。Shift 拘束中は 45° 刻みの角度へ吸着する。 */
function resolveDrawCurrent(
	i: { startImg: ImagePoint; currentImg: ImagePoint; constrain: boolean },
	img: ImageMetrics,
): ImagePoint {
	return i.constrain
		? constrainToAngleSnap(i.startImg, i.currentImg, img)
		: i.currentImg;
}

export type UseArrowEngineResult = {
	/** 表示用 arrow 配列。interaction 中はその矢印だけ delta 反映済 */
	renderedArrows: readonly ArrowAnnotation[];
	/** 描画中の preview 線分 (= まだ commit されていない)。seed は手書き風用 */
	previewArrow: {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		seed: number;
	} | null;
	/** drawing / moving / endpoint いずれか進行中か */
	isInteracting: boolean;
	beginDraw: (startImg: ImagePoint, constrain?: boolean) => void;
	beginMove: (id: string, startImg: ImagePoint) => void;
	beginEndpointDrag: (
		id: string,
		endpoint: ArrowEndpoint,
		startImg: ImagePoint,
	) => void;
	updateInteraction: (currentImg: ImagePoint, constrain?: boolean) => void;
	endInteraction: () => void;
	cancelInteraction: () => void;
	/** context にぶら下げる用の安定ハンドル。useEffect で ref へ差し込む */
	handle: ArrowEngineHandle;
};

/**
 * 矢印アノテーションの interaction 状態を管理。use-rect-engine.ts と同様、
 * ドラッグ中の中間状態は state + ref で扱い、endInteraction で初めて
 * context (= rect と共有の単一履歴) に commit する。
 */
export function useArrowEngine(image: ImageMetrics): UseArrowEngineResult {
	const { arrows, arrowDefaults, createArrow, updateArrow } = useSnapcrop();

	// interaction は表示にも使うので state で持ち、副作用は endInteraction で
	// ref を読んでから処理する (StrictMode の二重実行回避。rect 側と同じ理由)。
	const [interaction, setInteraction] = useState<Interaction | null>(null);
	const interactionRef = useRef<Interaction | null>(null);
	interactionRef.current = interaction;

	const imageRef = useRef(image);
	imageRef.current = image;
	const arrowDefaultsRef = useRef(arrowDefaults);
	arrowDefaultsRef.current = arrowDefaults;

	const beginDraw = useCallback((startImg: ImagePoint, constrain = false) => {
		setInteraction({
			kind: "drawing",
			startImg,
			currentImg: startImg,
			constrain,
			seed: newArrowSeed(),
		});
	}, []);

	const beginMove = useCallback(
		(id: string, startImg: ImagePoint) => {
			const target = arrows.find((a) => a.id === id);
			if (!target) return;
			setInteraction({
				kind: "moving",
				id,
				startImg,
				startArrow: target,
				currentImg: startImg,
				constrain: false,
			});
		},
		[arrows],
	);

	const beginEndpointDrag = useCallback(
		(id: string, endpoint: ArrowEndpoint, startImg: ImagePoint) => {
			const target = arrows.find((a) => a.id === id);
			if (!target) return;
			setInteraction({
				kind: "endpoint",
				id,
				endpoint,
				startImg,
				startArrow: target,
				currentImg: startImg,
				constrain: false,
			});
		},
		[arrows],
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
			const p2 = clampPointInImage(resolveDrawCurrent(prev, img), img);
			if (Math.hypot(p2.x - p1.x, p2.y - p1.y) >= MIN_ARROW_LENGTH) {
				const arrow = createArrowAnnotation({
					x1: p1.x,
					y1: p1.y,
					x2: p2.x,
					y2: p2.y,
					defaults: arrowDefaultsRef.current,
					seed: prev.seed,
				});
				createArrow(arrow);
			}
		} else if (prev.kind === "moving") {
			const dx = prev.currentImg.x - prev.startImg.x;
			const dy = prev.currentImg.y - prev.startImg.y;
			const next = moveArrow(prev.startArrow, { dx, dy }, img);
			updateArrow(prev.id, {
				x1: next.x1,
				y1: next.y1,
				x2: next.x2,
				y2: next.y2,
			});
		} else {
			const dx = prev.currentImg.x - prev.startImg.x;
			const dy = prev.currentImg.y - prev.startImg.y;
			const next = moveArrowEndpoint(
				prev.startArrow,
				prev.endpoint,
				{ dx, dy },
				img,
			);
			updateArrow(prev.id, {
				x1: next.x1,
				y1: next.y1,
				x2: next.x2,
				y2: next.y2,
			});
		}
		interactionRef.current = null;
		setInteraction(null);
	}, [createArrow, updateArrow]);

	// rendered = arrow list + interaction の delta を視覚的に反映
	const renderedArrows = useMemo(() => {
		if (!interaction || interaction.kind === "drawing") return arrows;
		const dx = interaction.currentImg.x - interaction.startImg.x;
		const dy = interaction.currentImg.y - interaction.startImg.y;
		const img = imageRef.current;
		return arrows.map((a) => {
			if (a.id !== interaction.id) return a;
			if (interaction.kind === "moving") {
				return moveArrow(interaction.startArrow, { dx, dy }, img);
			}
			return moveArrowEndpoint(
				interaction.startArrow,
				interaction.endpoint,
				{ dx, dy },
				img,
			);
		});
	}, [arrows, interaction]);

	const previewArrow = useMemo(() => {
		if (interaction?.kind !== "drawing") return null;
		const img = imageRef.current;
		const p1 = clampPointInImage(interaction.startImg, img);
		const p2 = clampPointInImage(resolveDrawCurrent(interaction, img), img);
		if (p1.x === p2.x && p1.y === p2.y) return null;
		return {
			x1: p1.x,
			y1: p1.y,
			x2: p2.x,
			y2: p2.y,
			seed: interaction.seed,
		};
	}, [interaction]);

	// handle: 上で持っている interactionRef を参照するだけの安定関数を返す
	const handle = useMemo<ArrowEngineHandle>(
		() => ({
			isInteracting: () => interactionRef.current !== null,
			cancelInteraction,
		}),
		[cancelInteraction],
	);

	return {
		renderedArrows,
		previewArrow,
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
