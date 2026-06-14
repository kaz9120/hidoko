import { useCallback, useMemo, useRef, useState } from "react";
import {
	type RectEngineHandle,
	useSnapcrop,
} from "~/contexts/snapcrop-context";
import { useShiftConstrainKey } from "~/hooks/use-shift-constrain-key";
import { constrainToSquare } from "~/lib/constrain";
import {
	cloneRectAnnotation,
	createRectAnnotation,
	duplicateRectAnnotation,
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
 * constrain は Shift 押下中の拘束 (drawing = 正方形 / resizing = 比率維持)。
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
			startRect: RectAnnotation;
			currentImg: ImagePoint;
			constrain: boolean;
	  }
	| {
			kind: "resizing";
			id: string;
			handle: ResizeHandle;
			startImg: ImagePoint;
			startRect: RectAnnotation;
			currentImg: ImagePoint;
			constrain: boolean;
	  }
	| {
			kind: "duplicating";
			/** 元と同位置に採番済みのコピー。pointerup まで context には入れない */
			copy: RectAnnotation;
			startImg: ImagePoint;
			currentImg: ImagePoint;
			constrain: boolean;
	  };

/** drawing 中の実効 current 点。Shift 拘束中は正方形になる点へ吸着する。 */
function resolveDrawCurrent(
	i: { startImg: ImagePoint; currentImg: ImagePoint; constrain: boolean },
	img: ImageMetrics,
): ImagePoint {
	return i.constrain
		? constrainToSquare(i.startImg, i.currentImg, img)
		: i.currentImg;
}

export type UseRectEngineResult = {
	/** 表示用 annotation 配列。interaction 中はその rect だけ delta 反映済 */
	renderedAnnotations: readonly RectAnnotation[];
	/** 描画中の preview rect (= まだ commit されていない) */
	previewRect: { x: number; y: number; width: number; height: number } | null;
	/** drawing / moving / resizing いずれか進行中か */
	isInteracting: boolean;
	beginDraw: (startImg: ImagePoint, constrain?: boolean) => void;
	beginMove: (id: string, startImg: ImagePoint) => void;
	/**
	 * Alt+ドラッグ複製を開始する。source のコピーをその場に作り、以後の
	 * ドラッグはコピー側を動かす (元は動かない)。endInteraction で初めて
	 * コピーを context に commit するので、複製は undo 1 回で取り消せる。
	 */
	beginDuplicate: (source: RectAnnotation, startImg: ImagePoint) => void;
	beginResize: (
		id: string,
		handle: ResizeHandle,
		startImg: ImagePoint,
		constrain?: boolean,
	) => void;
	updateInteraction: (currentImg: ImagePoint, constrain?: boolean) => void;
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
	const {
		activeTool,
		annotations,
		rectDefaults,
		createAnnotation,
		updateAnnotation,
	} = useSnapcrop();

	// interaction は表示にも使うので state で持つ (毎回 re-render する)。
	// ただし副作用 (createAnnotation / updateAnnotation) を setState updater 内で
	// 走らせると StrictMode で二重実行されうるため、最新値は interactionRef で
	// 別途追っておき、endInteraction では ref を読んでから setInteraction(null) する。
	const [interaction, setInteraction] = useState<Interaction | null>(null);
	const interactionRef = useRef<Interaction | null>(null);
	interactionRef.current = interaction;

	const imageRef = useRef(image);
	imageRef.current = image;
	// mosaic ツール選択中は新規描画の style を強制的に "mosaic" にする
	// (Issue #146 のモザイク独立化)。矩形ツールでは style: "outline" 専用
	// (PR #159 で「塗り」は UI から廃止済み)。
	const effectiveRectDefaults: typeof rectDefaults =
		activeTool === "mosaic"
			? { ...rectDefaults, style: "mosaic" }
			: { ...rectDefaults, style: "outline" };
	const rectDefaultsRef = useRef(effectiveRectDefaults);
	rectDefaultsRef.current = effectiveRectDefaults;

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
			const target = annotations.find((a) => a.id === id);
			if (!target) return;
			setInteraction({
				kind: "moving",
				id,
				startImg,
				startRect: target,
				currentImg: startImg,
				constrain: false,
			});
		},
		[annotations],
	);

	const beginDuplicate = useCallback(
		(source: RectAnnotation, startImg: ImagePoint) => {
			setInteraction({
				kind: "duplicating",
				copy: cloneRectAnnotation(source),
				startImg,
				currentImg: startImg,
				constrain: false,
			});
		},
		[],
	);

	const beginResize = useCallback(
		(
			id: string,
			handle: ResizeHandle,
			startImg: ImagePoint,
			constrain = false,
		) => {
			const target = annotations.find((a) => a.id === id);
			if (!target) return;
			setInteraction({
				kind: "resizing",
				id,
				handle,
				startImg,
				startRect: target,
				currentImg: startImg,
				constrain,
			});
		},
		[annotations],
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
			const rect = normalizeDrawingRect(
				prev.startImg,
				resolveDrawCurrent(prev, img),
				img,
			);
			if (rect.width >= MIN_RECT_SIZE && rect.height >= MIN_RECT_SIZE) {
				const annotation = createRectAnnotation({
					...rect,
					defaults: rectDefaultsRef.current,
				});
				createAnnotation(annotation);
			}
		} else if (prev.kind === "duplicating") {
			const dx = prev.currentImg.x - prev.startImg.x;
			const dy = prev.currentImg.y - prev.startImg.y;
			// 動かさず放したときは元と完全に重なって気づけないため、⌘D と同じ
			// オフセット配置にフォールバックする
			createAnnotation(
				dx === 0 && dy === 0
					? duplicateRectAnnotation(prev.copy, img)
					: moveAnnotation(prev.copy, { dx, dy }, img),
			);
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
				prev.constrain,
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
		if (interaction.kind === "duplicating") {
			// commit 前のコピーを末尾 (= 同種内で最前面) に足して見せる
			return [
				...annotations,
				moveAnnotation(interaction.copy, { dx, dy }, img),
			];
		}
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
				interaction.constrain,
			);
		});
	}, [annotations, interaction]);

	const previewRect = useMemo(() => {
		if (interaction?.kind !== "drawing") return null;
		const rect = normalizeDrawingRect(
			interaction.startImg,
			resolveDrawCurrent(interaction, imageRef.current),
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
		beginDuplicate,
		beginResize,
		updateInteraction,
		endInteraction,
		cancelInteraction,
		handle,
	};
}
