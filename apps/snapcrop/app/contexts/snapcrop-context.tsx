import {
	createContext,
	type ReactNode,
	type RefObject,
	use,
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import type { ViewportHandle } from "~/components/canvas/viewport";
import type { CropData, CropEngineHandle } from "~/hooks/use-crop-engine";
import {
	loadRectDefaults,
	saveRectDefaults,
} from "~/lib/rect-defaults-storage";
import {
	DEFAULT_RECT_DEFAULTS,
	type RectAnnotation,
	type RectAnnotationPatch,
	type RectDefaults,
} from "~/lib/rect-engine";

export type { CropData } from "~/hooks/use-crop-engine";
export type {
	Annotation,
	RectAnnotation,
	RectAnnotationPatch,
	RectDefaults,
	RectStyle,
	RectThickness,
} from "~/lib/rect-engine";

export type LoadedImage = {
	src: string;
	blob: Blob;
	width: number;
	height: number;
	format: string;
	fileSize: number;
};

export type ActiveTool = "crop" | "rect";

/**
 * 矩形ツールのキーボード操作 (Esc キャンセル, Space pan 抑制) が、
 * RectInteractionLayer や useRectShortcuts から engine の状態に触れるための
 * 共有ハンドル。ImageStage 内で engine が組み立てた値を ref に書き込む。
 */
export type RectEngineHandle = {
	isInteracting: () => boolean;
	cancelInteraction: () => void;
};

type SnapcropContextValue = {
	image: LoadedImage | null;
	loadImageFromBlob: (blob: Blob) => Promise<void>;
	clearImage: () => void;
	cropperRef: RefObject<CropEngineHandle | null>;
	cropData: CropData | null;
	setCropData: (data: CropData | null) => void;
	historyIndex: number;
	historyLength: number;
	canUndo: boolean;
	canRedo: boolean;
	undo: () => void;
	redo: () => void;

	activeTool: ActiveTool;
	setActiveTool: (tool: ActiveTool) => void;

	/**
	 * キャンバスのズーム倍率 (1 = 100%)。実体は Viewport が onZoomChange で
	 * 書き込む。ヘッダーの ZoomControl が % 表示のために購読する。
	 */
	zoom: number;
	setZoom: (zoom: number) => void;
	/**
	 * Viewport の imperative ハンドル。ヘッダーやショートカットが
	 * fit / 100% / 任意倍率ズームを呼ぶための共有 ref。画像未ロード時は null。
	 */
	viewportRef: RefObject<ViewportHandle | null>;

	/**
	 * クロップツールの UI 状態。CropToolbar が読み書きする。画像差し替えで
	 * 自動的に "free" / 横向き にリセットされる (画像ごとに比率を選び直す前提)。
	 */
	cropAspectRatioId: string;
	setCropAspectRatioId: (id: string) => void;
	cropIsPortrait: boolean;
	setCropIsPortrait: (portrait: boolean) => void;

	annotations: readonly RectAnnotation[];
	selectedAnnotationId: string | null;
	selectAnnotation: (id: string | null) => void;

	rectDefaults: RectDefaults;
	setRectDefaults: (next: RectDefaults) => void;

	createAnnotation: (annotation: RectAnnotation) => void;
	updateAnnotation: (
		id: string,
		patch: RectAnnotationPatch,
		opts?: { batchKey?: string },
	) => void;
	deleteAnnotation: (id: string) => void;

	rectEngineHandleRef: RefObject<RectEngineHandle | null>;
	spacePressedRef: RefObject<boolean>;
};

const SnapcropContext = createContext<SnapcropContextValue | null>(null);

const HISTORY_LIMIT = 50;
const ANNOTATION_OPS_LIMIT = 100;
const NUDGE_MERGE_WINDOW_MS = 250;

type ImageHistoryState = {
	history: LoadedImage[];
	index: number;
};

type AnnotationOp =
	| { type: "rect.create"; annotation: RectAnnotation }
	| {
			type: "rect.update";
			id: string;
			prev: RectAnnotation;
			next: RectAnnotation;
	  }
	| { type: "rect.delete"; annotation: RectAnnotation };

type AnnotationHistoryState = {
	annotations: readonly RectAnnotation[];
	ops: AnnotationOp[];
	/** -1 = まだ何も適用されていない、N = ops[N] を直前に適用済。 */
	cursor: number;
	lastOpTimestamp: number;
	lastOpBatchKey: string | null;
};

type State = {
	image: ImageHistoryState;
	annotation: AnnotationHistoryState;
	activeTool: ActiveTool;
	selectedAnnotationId: string | null;
	rectDefaults: RectDefaults;
};

type Action =
	| { type: "LOAD"; image: LoadedImage }
	| { type: "UNDO_IMAGE" }
	| { type: "REDO_IMAGE" }
	| { type: "CLEAR" }
	| { type: "SET_ACTIVE_TOOL"; tool: ActiveTool }
	| { type: "SET_RECT_DEFAULTS"; defaults: RectDefaults }
	| { type: "SELECT_ANNOT"; id: string | null }
	| { type: "RECT_CREATE"; annotation: RectAnnotation; timestamp: number }
	| {
			type: "RECT_UPDATE";
			id: string;
			patch: RectAnnotationPatch;
			batchKey: string | null;
			timestamp: number;
	  }
	| { type: "RECT_DELETE"; id: string; timestamp: number }
	| { type: "ANNOT_UNDO" }
	| { type: "ANNOT_REDO" };

const EMPTY_ANNOTATION: AnnotationHistoryState = {
	annotations: [],
	ops: [],
	cursor: -1,
	lastOpTimestamp: 0,
	lastOpBatchKey: null,
};

const initialState: State = {
	image: { history: [], index: -1 },
	annotation: EMPTY_ANNOTATION,
	activeTool: "crop",
	selectedAnnotationId: null,
	rectDefaults: DEFAULT_RECT_DEFAULTS,
};

/** annotations を createdAt 昇順 (古い順 = z-order 下) に保つユーティリティ。 */
function sortAnnotations(
	list: readonly RectAnnotation[],
): readonly RectAnnotation[] {
	return [...list].sort((a, b) => a.createdAt - b.createdAt);
}

function applyForward(
	annotations: readonly RectAnnotation[],
	op: AnnotationOp,
): readonly RectAnnotation[] {
	switch (op.type) {
		case "rect.create":
			return sortAnnotations([...annotations, op.annotation]);
		case "rect.update":
			return annotations.map((a) => (a.id === op.id ? op.next : a));
		case "rect.delete":
			return annotations.filter((a) => a.id !== op.annotation.id);
	}
}

function applyReverse(
	annotations: readonly RectAnnotation[],
	op: AnnotationOp,
): readonly RectAnnotation[] {
	switch (op.type) {
		case "rect.create":
			return annotations.filter((a) => a.id !== op.annotation.id);
		case "rect.update":
			return annotations.map((a) => (a.id === op.id ? op.prev : a));
		case "rect.delete":
			return sortAnnotations([...annotations, op.annotation]);
	}
}

function pruneSelection(
	id: string | null,
	annotations: readonly RectAnnotation[],
): string | null {
	if (id === null) return null;
	return annotations.some((a) => a.id === id) ? id : null;
}

function rectShallowEqual(a: RectAnnotation, b: RectAnnotation): boolean {
	return (
		a.x === b.x &&
		a.y === b.y &&
		a.width === b.width &&
		a.height === b.height &&
		a.style === b.style &&
		a.color === b.color &&
		a.thickness === b.thickness
	);
}

function pushOp(
	state: AnnotationHistoryState,
	op: AnnotationOp,
	batchKey: string | null,
	timestamp: number,
): AnnotationHistoryState {
	// merge 判定: 直前の op が rect.update で同 id・同 batchKey、かつ 250ms 以内
	const last = state.cursor >= 0 ? state.ops[state.cursor] : null;
	const canMerge =
		op.type === "rect.update" &&
		last !== null &&
		last.type === "rect.update" &&
		batchKey !== null &&
		state.lastOpBatchKey === batchKey &&
		last.id === op.id &&
		timestamp - state.lastOpTimestamp < NUDGE_MERGE_WINDOW_MS;

	let nextOps: AnnotationOp[];
	let nextCursor: number;
	if (canMerge) {
		nextOps = [...state.ops];
		// last は rect.update 確定なので、prev を保ったまま next を上書き
		const merged: AnnotationOp = {
			type: "rect.update",
			id: (last as { type: "rect.update"; id: string }).id,
			prev: (last as { type: "rect.update"; prev: RectAnnotation }).prev,
			next: (op as { type: "rect.update"; next: RectAnnotation }).next,
		};
		nextOps[state.cursor] = merged;
		nextCursor = state.cursor;
	} else {
		// 既存 redo 候補を破棄してから push
		nextOps = [...state.ops.slice(0, state.cursor + 1), op];
		nextCursor = nextOps.length - 1;
	}

	// 上限を超えたら古い op を間引く
	while (nextOps.length > ANNOTATION_OPS_LIMIT) {
		nextOps = nextOps.slice(1);
		nextCursor -= 1;
	}

	const nextAnnotations = applyForward(state.annotations, op);

	return {
		annotations: nextAnnotations,
		ops: nextOps,
		cursor: nextCursor,
		lastOpTimestamp: timestamp,
		lastOpBatchKey: batchKey,
	};
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "LOAD": {
			// 現在位置より先 (redo 候補) を破棄しつつ URL を revoke
			for (const discard of state.image.history.slice(state.image.index + 1)) {
				URL.revokeObjectURL(discard.src);
			}
			let next = [
				...state.image.history.slice(0, state.image.index + 1),
				action.image,
			];
			let nextIndex = next.length - 1;
			while (next.length > HISTORY_LIMIT) {
				const removed = next[0];
				URL.revokeObjectURL(removed.src);
				next = next.slice(1);
				nextIndex -= 1;
			}
			return {
				...state,
				image: { history: next, index: nextIndex },
				annotation: EMPTY_ANNOTATION,
				selectedAnnotationId: null,
				activeTool: "crop",
			};
		}
		case "UNDO_IMAGE":
			if (state.image.index <= 0) return state;
			return {
				...state,
				image: { ...state.image, index: state.image.index - 1 },
				annotation: EMPTY_ANNOTATION,
				selectedAnnotationId: null,
				activeTool: "crop",
			};
		case "REDO_IMAGE":
			if (state.image.index >= state.image.history.length - 1) return state;
			return {
				...state,
				image: { ...state.image, index: state.image.index + 1 },
				annotation: EMPTY_ANNOTATION,
				selectedAnnotationId: null,
				activeTool: "crop",
			};
		case "CLEAR": {
			for (const item of state.image.history) {
				URL.revokeObjectURL(item.src);
			}
			return {
				...initialState,
				rectDefaults: state.rectDefaults, // ユーザ設定は維持
			};
		}
		case "SET_ACTIVE_TOOL":
			// 画像がない時に rect は無意味なので強制 crop fallback
			if (state.image.index < 0 && action.tool === "rect") {
				return { ...state, activeTool: "crop" };
			}
			if (state.activeTool === action.tool) return state;
			return {
				...state,
				activeTool: action.tool,
				// ツール切替時に selection を残しても表示上の意味がないのでクリア
				selectedAnnotationId:
					action.tool === "rect" ? state.selectedAnnotationId : null,
			};
		case "SET_RECT_DEFAULTS":
			return { ...state, rectDefaults: action.defaults };
		case "SELECT_ANNOT":
			if (state.selectedAnnotationId === action.id) return state;
			return { ...state, selectedAnnotationId: action.id };
		case "RECT_CREATE": {
			const op: AnnotationOp = {
				type: "rect.create",
				annotation: action.annotation,
			};
			const nextAnnotation = pushOp(
				state.annotation,
				op,
				null,
				action.timestamp,
			);
			return {
				...state,
				annotation: nextAnnotation,
				selectedAnnotationId: action.annotation.id,
			};
		}
		case "RECT_UPDATE": {
			const prev = state.annotation.annotations.find((a) => a.id === action.id);
			if (!prev) return state;
			const next: RectAnnotation = { ...prev, ...action.patch };
			if (rectShallowEqual(prev, next)) return state;
			const op: AnnotationOp = {
				type: "rect.update",
				id: action.id,
				prev,
				next,
			};
			const nextAnnotation = pushOp(
				state.annotation,
				op,
				action.batchKey,
				action.timestamp,
			);
			return { ...state, annotation: nextAnnotation };
		}
		case "RECT_DELETE": {
			const target = state.annotation.annotations.find(
				(a) => a.id === action.id,
			);
			if (!target) return state;
			const op: AnnotationOp = { type: "rect.delete", annotation: target };
			const nextAnnotation = pushOp(
				state.annotation,
				op,
				null,
				action.timestamp,
			);
			const nextSelected =
				state.selectedAnnotationId === action.id
					? null
					: state.selectedAnnotationId;
			return {
				...state,
				annotation: nextAnnotation,
				selectedAnnotationId: nextSelected,
			};
		}
		case "ANNOT_UNDO": {
			if (state.annotation.cursor < 0) return state;
			const op = state.annotation.ops[state.annotation.cursor];
			const nextAnnotations = applyReverse(state.annotation.annotations, op);
			return {
				...state,
				annotation: {
					...state.annotation,
					annotations: nextAnnotations,
					cursor: state.annotation.cursor - 1,
					// 直後の連続操作と batch merge されないように batchKey をリセット
					lastOpBatchKey: null,
				},
				selectedAnnotationId: pruneSelection(
					state.selectedAnnotationId,
					nextAnnotations,
				),
			};
		}
		case "ANNOT_REDO": {
			if (state.annotation.cursor >= state.annotation.ops.length - 1)
				return state;
			const op = state.annotation.ops[state.annotation.cursor + 1];
			const nextAnnotations = applyForward(state.annotation.annotations, op);
			return {
				...state,
				annotation: {
					...state.annotation,
					annotations: nextAnnotations,
					cursor: state.annotation.cursor + 1,
					lastOpBatchKey: null,
				},
				selectedAnnotationId: pruneSelection(
					state.selectedAnnotationId,
					nextAnnotations,
				),
			};
		}
	}
}

export function SnapcropProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(reducer, initialState, (init) => ({
		...init,
		rectDefaults: loadRectDefaults(),
	}));
	const cropperRef = useRef<CropEngineHandle | null>(null);
	const rectEngineHandleRef = useRef<RectEngineHandle | null>(null);
	const viewportRef = useRef<ViewportHandle | null>(null);
	const spacePressedRef = useRef<boolean>(false);
	const [cropData, setCropData] = useState<CropData | null>(null);
	const [zoom, setZoom] = useState(1);
	const [cropAspectRatioId, setCropAspectRatioIdState] = useState("free");
	const [cropIsPortrait, setCropIsPortraitState] = useState(false);

	// rectDefaults の変化を localStorage に書き出す。swatch クリック頻度なら
	// 直接書きで十分 (debounce 不要)。
	useEffect(() => {
		saveRectDefaults(state.rectDefaults);
	}, [state.rectDefaults]);

	// 画像が差し替わったら crop UI 状態をリセット (画像ごとに比率を選び直す)。
	// 既存 site-header の useEffect ロジックを Provider 側に引き上げ。
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional change-detection on image identity
	useEffect(() => {
		setCropAspectRatioIdState("free");
		setCropIsPortraitState(false);
	}, [state.image.index]);

	const stableSetCropData = useCallback(
		(data: CropData | null) => setCropData(data),
		[],
	);

	const value = useMemo<SnapcropContextValue>(() => {
		const image =
			state.image.index >= 0 ? state.image.history[state.image.index] : null;
		const annotCanUndo = state.annotation.cursor >= 0;
		const annotCanRedo =
			state.annotation.cursor < state.annotation.ops.length - 1;
		const imageCanUndo = state.image.index > 0;
		const imageCanRedo = state.image.index < state.image.history.length - 1;

		return {
			image: image ?? null,
			loadImageFromBlob: async (blob: Blob) => {
				const next = await readImageFromBlob(blob);
				dispatch({ type: "LOAD", image: next });
			},
			clearImage: () => dispatch({ type: "CLEAR" }),
			cropperRef,
			cropData,
			setCropData: stableSetCropData,
			historyIndex: state.image.index,
			historyLength: state.image.history.length,
			canUndo: annotCanUndo || imageCanUndo,
			canRedo: annotCanRedo || imageCanRedo,
			undo: () => {
				// annotation 履歴を優先消費、なくなったら image undo
				if (annotCanUndo) {
					dispatch({ type: "ANNOT_UNDO" });
				} else if (imageCanUndo) {
					dispatch({ type: "UNDO_IMAGE" });
				}
			},
			redo: () => {
				if (annotCanRedo) {
					dispatch({ type: "ANNOT_REDO" });
				} else if (imageCanRedo) {
					dispatch({ type: "REDO_IMAGE" });
				}
			},

			activeTool: state.activeTool,
			setActiveTool: (tool) => dispatch({ type: "SET_ACTIVE_TOOL", tool }),

			zoom,
			setZoom,
			viewportRef,

			annotations: state.annotation.annotations,
			selectedAnnotationId: state.selectedAnnotationId,
			selectAnnotation: (id) => dispatch({ type: "SELECT_ANNOT", id }),

			rectDefaults: state.rectDefaults,
			setRectDefaults: (defaults) =>
				dispatch({ type: "SET_RECT_DEFAULTS", defaults }),

			createAnnotation: (annotation) =>
				dispatch({
					type: "RECT_CREATE",
					annotation,
					timestamp: Date.now(),
				}),
			updateAnnotation: (id, patch, opts) =>
				dispatch({
					type: "RECT_UPDATE",
					id,
					patch,
					batchKey: opts?.batchKey ?? null,
					timestamp: Date.now(),
				}),
			deleteAnnotation: (id) =>
				dispatch({ type: "RECT_DELETE", id, timestamp: Date.now() }),

			rectEngineHandleRef,
			spacePressedRef,

			cropAspectRatioId,
			setCropAspectRatioId: setCropAspectRatioIdState,
			cropIsPortrait,
			setCropIsPortrait: setCropIsPortraitState,
		};
	}, [
		state,
		cropData,
		stableSetCropData,
		cropAspectRatioId,
		cropIsPortrait,
		zoom,
	]);

	return (
		<SnapcropContext.Provider value={value}>
			{children}
		</SnapcropContext.Provider>
	);
}

export function useSnapcrop(): SnapcropContextValue {
	const ctx = use(SnapcropContext);
	if (!ctx) {
		throw new Error("useSnapcrop must be used within SnapcropProvider");
	}
	return ctx;
}

async function readImageFromBlob(blob: Blob): Promise<LoadedImage> {
	const src = URL.createObjectURL(blob);
	const img = new Image();
	await new Promise<void>((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => {
			URL.revokeObjectURL(src);
			reject(new Error("Failed to decode image"));
		};
		img.src = src;
	});
	return {
		src,
		blob,
		width: img.naturalWidth,
		height: img.naturalHeight,
		format: blob.type || "image/png",
		fileSize: blob.size,
	};
}
