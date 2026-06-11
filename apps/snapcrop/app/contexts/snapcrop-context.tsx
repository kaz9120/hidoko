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
	loadArrowDefaults,
	saveArrowDefaults,
} from "~/lib/arrow-defaults-storage";
import {
	type ArrowAnnotation,
	type ArrowAnnotationPatch,
	type ArrowDefaults,
	DEFAULT_ARROW_DEFAULTS,
} from "~/lib/arrow-engine";
import { type ImageSource, resolveImageFileName } from "~/lib/file-name";
import {
	loadHighlightDefaults,
	saveHighlightDefaults,
} from "~/lib/highlight-defaults-storage";
import {
	DEFAULT_HIGHLIGHT_DEFAULTS,
	type HighlightAnnotation,
	type HighlightAnnotationPatch,
	type HighlightDefaults,
} from "~/lib/highlight-engine";
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
import {
	loadTextDefaults,
	saveTextDefaults,
} from "~/lib/text-defaults-storage";
import {
	DEFAULT_TEXT_DEFAULTS,
	type TextAnnotation,
	type TextAnnotationPatch,
	type TextDefaults,
} from "~/lib/text-engine";

export type { CropData } from "~/hooks/use-crop-engine";
export type {
	ArrowAnnotation,
	ArrowAnnotationPatch,
	ArrowCapStyle,
	ArrowDefaults,
	ArrowLineStyle,
	ArrowThickness,
} from "~/lib/arrow-engine";
export type { ImageSource } from "~/lib/file-name";
export type {
	HighlightAnnotation,
	HighlightAnnotationPatch,
	HighlightDefaults,
	HighlightThickness,
} from "~/lib/highlight-engine";
export type {
	Annotation,
	RectAnnotation,
	RectAnnotationPatch,
	RectDefaults,
	RectStyle,
	RectThickness,
} from "~/lib/rect-engine";
export type {
	TextAlign,
	TextAnnotation,
	TextAnnotationPatch,
	TextBackground,
	TextDefaults,
	TextFontFamily,
} from "~/lib/text-engine";

export type LoadedImage = {
	src: string;
	blob: Blob;
	width: number;
	height: number;
	format: string;
	fileSize: number;
	/** 表示用ファイル名。名前のない blob 由来は経路ごとの生成名が入る。 */
	fileName: string;
};

export type ActiveTool = "crop" | "rect" | "arrow" | "text" | "highlight";

/**
 * 矩形ツールのキーボード操作 (Esc キャンセル, Space pan 抑制) が、
 * RectInteractionLayer や useRectShortcuts から engine の状態に触れるための
 * 共有ハンドル。ImageStage 内で engine が組み立てた値を ref に書き込む。
 */
export type RectEngineHandle = {
	isInteracting: () => boolean;
	cancelInteraction: () => void;
};

/**
 * 矢印ツール用の共有ハンドル。形は RectEngineHandle と同じ
 * (isInteracting / cancelInteraction)。useArrowShortcuts の Esc キャンセルが使う。
 */
export type ArrowEngineHandle = RectEngineHandle;

/**
 * テキストツール用の共有ハンドル。形は RectEngineHandle と同じ
 * (isInteracting / cancelInteraction)。isInteracting は移動中だけでなく
 * インライン編集中も true を返す。useTextShortcuts の Esc キャンセルと、
 * use-rect-shortcuts の「どの engine も interacting でないとき選択解除」
 * 判定が使う。
 */
export type TextEngineHandle = RectEngineHandle;

/**
 * マーカーツール用の共有ハンドル。形は RectEngineHandle と同じ
 * (isInteracting / cancelInteraction)。useHighlightShortcuts の Esc キャンセルが使う。
 */
export type HighlightEngineHandle = RectEngineHandle;

type SnapcropContextValue = {
	image: LoadedImage | null;
	loadImageFromBlob: (blob: Blob, source?: ImageSource) => Promise<void>;
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

	arrows: readonly ArrowAnnotation[];

	arrowDefaults: ArrowDefaults;
	setArrowDefaults: (next: ArrowDefaults) => void;

	createArrow: (arrow: ArrowAnnotation) => void;
	updateArrow: (
		id: string,
		patch: ArrowAnnotationPatch,
		opts?: { batchKey?: string },
	) => void;
	deleteArrow: (id: string) => void;

	texts: readonly TextAnnotation[];

	textDefaults: TextDefaults;
	setTextDefaults: (next: TextDefaults) => void;

	createText: (text: TextAnnotation) => void;
	updateText: (
		id: string,
		patch: TextAnnotationPatch,
		opts?: { batchKey?: string },
	) => void;
	deleteText: (id: string) => void;

	highlights: readonly HighlightAnnotation[];

	highlightDefaults: HighlightDefaults;
	setHighlightDefaults: (next: HighlightDefaults) => void;

	createHighlight: (highlight: HighlightAnnotation) => void;
	updateHighlight: (
		id: string,
		patch: HighlightAnnotationPatch,
		opts?: { batchKey?: string },
	) => void;
	deleteHighlight: (id: string) => void;

	rectEngineHandleRef: RefObject<RectEngineHandle | null>;
	arrowEngineHandleRef: RefObject<ArrowEngineHandle | null>;
	textEngineHandleRef: RefObject<TextEngineHandle | null>;
	highlightEngineHandleRef: RefObject<HighlightEngineHandle | null>;
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
	| { type: "rect.delete"; annotation: RectAnnotation }
	| { type: "arrow.create"; annotation: ArrowAnnotation }
	| {
			type: "arrow.update";
			id: string;
			prev: ArrowAnnotation;
			next: ArrowAnnotation;
	  }
	| { type: "arrow.delete"; annotation: ArrowAnnotation }
	| { type: "text.create"; annotation: TextAnnotation }
	| {
			type: "text.update";
			id: string;
			prev: TextAnnotation;
			next: TextAnnotation;
	  }
	| { type: "text.delete"; annotation: TextAnnotation }
	| { type: "highlight.create"; annotation: HighlightAnnotation }
	| {
			type: "highlight.update";
			id: string;
			prev: HighlightAnnotation;
			next: HighlightAnnotation;
	  }
	| { type: "highlight.delete"; annotation: HighlightAnnotation };

/** rect 系 op だけを抜き出した補助型。applyForward / applyReverse が受け取る。 */
type RectOp = Extract<
	AnnotationOp,
	{ type: "rect.create" | "rect.update" | "rect.delete" }
>;

/** arrow 系 op だけを抜き出した補助型。applyArrowForward / applyArrowReverse が受け取る。 */
type ArrowOp = Extract<
	AnnotationOp,
	{ type: "arrow.create" | "arrow.update" | "arrow.delete" }
>;

/** op の種別ルーター。else 側は RectOp に narrowing される。 */
function isArrowOp(op: AnnotationOp): op is ArrowOp {
	return op.type.startsWith("arrow.");
}

/** text 系 op だけを抜き出した補助型。applyTextForward / applyTextReverse が受け取る。 */
type TextOp = Extract<
	AnnotationOp,
	{ type: "text.create" | "text.update" | "text.delete" }
>;

/** isArrowOp と同形の型ガード (text 版)。 */
function isTextOp(op: AnnotationOp): op is TextOp {
	return op.type.startsWith("text.");
}

/** highlight 系 op だけを抜き出した補助型。applyHighlightForward / applyHighlightReverse が受け取る。 */
type HighlightOp = Extract<
	AnnotationOp,
	{ type: "highlight.create" | "highlight.update" | "highlight.delete" }
>;

/** op の種別ルーター (highlight 版)。isArrowOp と同形。 */
function isHighlightOp(op: AnnotationOp): op is HighlightOp {
	return op.type.startsWith("highlight.");
}

type AnnotationHistoryState = {
	annotations: readonly RectAnnotation[];
	arrows: readonly ArrowAnnotation[];
	texts: readonly TextAnnotation[];
	highlights: readonly HighlightAnnotation[];
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
	arrowDefaults: ArrowDefaults;
	textDefaults: TextDefaults;
	highlightDefaults: HighlightDefaults;
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
	| { type: "SET_ARROW_DEFAULTS"; defaults: ArrowDefaults }
	| { type: "ARROW_CREATE"; annotation: ArrowAnnotation; timestamp: number }
	| {
			type: "ARROW_UPDATE";
			id: string;
			patch: ArrowAnnotationPatch;
			batchKey: string | null;
			timestamp: number;
	  }
	| { type: "ARROW_DELETE"; id: string; timestamp: number }
	| { type: "SET_TEXT_DEFAULTS"; defaults: TextDefaults }
	| { type: "TEXT_CREATE"; annotation: TextAnnotation; timestamp: number }
	| {
			type: "TEXT_UPDATE";
			id: string;
			patch: TextAnnotationPatch;
			batchKey: string | null;
			timestamp: number;
	  }
	| { type: "TEXT_DELETE"; id: string; timestamp: number }
	| { type: "SET_HIGHLIGHT_DEFAULTS"; defaults: HighlightDefaults }
	| {
			type: "HIGHLIGHT_CREATE";
			annotation: HighlightAnnotation;
			timestamp: number;
	  }
	| {
			type: "HIGHLIGHT_UPDATE";
			id: string;
			patch: HighlightAnnotationPatch;
			batchKey: string | null;
			timestamp: number;
	  }
	| { type: "HIGHLIGHT_DELETE"; id: string; timestamp: number }
	| { type: "ANNOT_UNDO" }
	| { type: "ANNOT_REDO" };

const EMPTY_ANNOTATION: AnnotationHistoryState = {
	annotations: [],
	arrows: [],
	texts: [],
	highlights: [],
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
	arrowDefaults: DEFAULT_ARROW_DEFAULTS,
	textDefaults: DEFAULT_TEXT_DEFAULTS,
	highlightDefaults: DEFAULT_HIGHLIGHT_DEFAULTS,
};

/** annotations を createdAt 昇順 (古い順 = z-order 下) に保つユーティリティ。 */
function sortAnnotations(
	list: readonly RectAnnotation[],
): readonly RectAnnotation[] {
	return [...list].sort((a, b) => a.createdAt - b.createdAt);
}

function applyForward(
	annotations: readonly RectAnnotation[],
	op: RectOp,
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
	op: RectOp,
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

/** arrows を createdAt 昇順 (古い順 = z-order 下) に保つユーティリティ。 */
function sortArrows(
	list: readonly ArrowAnnotation[],
): readonly ArrowAnnotation[] {
	return [...list].sort((a, b) => a.createdAt - b.createdAt);
}

function applyArrowForward(
	arrows: readonly ArrowAnnotation[],
	op: ArrowOp,
): readonly ArrowAnnotation[] {
	switch (op.type) {
		case "arrow.create":
			return sortArrows([...arrows, op.annotation]);
		case "arrow.update":
			return arrows.map((a) => (a.id === op.id ? op.next : a));
		case "arrow.delete":
			return arrows.filter((a) => a.id !== op.annotation.id);
	}
}

function applyArrowReverse(
	arrows: readonly ArrowAnnotation[],
	op: ArrowOp,
): readonly ArrowAnnotation[] {
	switch (op.type) {
		case "arrow.create":
			return arrows.filter((a) => a.id !== op.annotation.id);
		case "arrow.update":
			return arrows.map((a) => (a.id === op.id ? op.prev : a));
		case "arrow.delete":
			return sortArrows([...arrows, op.annotation]);
	}
}

/** texts を createdAt 昇順 (古い順 = z-order 下) に保つユーティリティ。 */
function sortTexts(list: readonly TextAnnotation[]): readonly TextAnnotation[] {
	return [...list].sort((a, b) => a.createdAt - b.createdAt);
}

function applyTextForward(
	texts: readonly TextAnnotation[],
	op: TextOp,
): readonly TextAnnotation[] {
	switch (op.type) {
		case "text.create":
			return sortTexts([...texts, op.annotation]);
		case "text.update":
			return texts.map((t) => (t.id === op.id ? op.next : t));
		case "text.delete":
			return texts.filter((t) => t.id !== op.annotation.id);
	}
}

function applyTextReverse(
	texts: readonly TextAnnotation[],
	op: TextOp,
): readonly TextAnnotation[] {
	switch (op.type) {
		case "text.create":
			return texts.filter((t) => t.id !== op.annotation.id);
		case "text.update":
			return texts.map((t) => (t.id === op.id ? op.prev : t));
		case "text.delete":
			return sortTexts([...texts, op.annotation]);
	}
}

/** highlights を createdAt 昇順 (古い順 = z-order 下) に保つユーティリティ。 */
function sortHighlights(
	list: readonly HighlightAnnotation[],
): readonly HighlightAnnotation[] {
	return [...list].sort((a, b) => a.createdAt - b.createdAt);
}

function applyHighlightForward(
	highlights: readonly HighlightAnnotation[],
	op: HighlightOp,
): readonly HighlightAnnotation[] {
	switch (op.type) {
		case "highlight.create":
			return sortHighlights([...highlights, op.annotation]);
		case "highlight.update":
			return highlights.map((a) => (a.id === op.id ? op.next : a));
		case "highlight.delete":
			return highlights.filter((a) => a.id !== op.annotation.id);
	}
}

function applyHighlightReverse(
	highlights: readonly HighlightAnnotation[],
	op: HighlightOp,
): readonly HighlightAnnotation[] {
	switch (op.type) {
		case "highlight.create":
			return highlights.filter((a) => a.id !== op.annotation.id);
		case "highlight.update":
			return highlights.map((a) => (a.id === op.id ? op.prev : a));
		case "highlight.delete":
			return sortHighlights([...highlights, op.annotation]);
	}
}

function pruneSelection(
	id: string | null,
	annotations: readonly RectAnnotation[],
	arrows: readonly ArrowAnnotation[],
	texts: readonly TextAnnotation[] = [],
	highlights: readonly HighlightAnnotation[] = [],
): string | null {
	if (id === null) return null;
	return annotations.some((a) => a.id === id) ||
		arrows.some((a) => a.id === id) ||
		texts.some((t) => t.id === id) ||
		highlights.some((a) => a.id === id)
		? id
		: null;
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

function arrowShallowEqual(a: ArrowAnnotation, b: ArrowAnnotation): boolean {
	return (
		a.x1 === b.x1 &&
		a.y1 === b.y1 &&
		a.x2 === b.x2 &&
		a.y2 === b.y2 &&
		a.line === b.line &&
		a.startCap === b.startCap &&
		a.endCap === b.endCap &&
		a.color === b.color &&
		a.thickness === b.thickness
	);
}

function textShallowEqual(a: TextAnnotation, b: TextAnnotation): boolean {
	return (
		a.x === b.x &&
		a.y === b.y &&
		a.text === b.text &&
		a.fontFamily === b.fontFamily &&
		a.fontSize === b.fontSize &&
		a.align === b.align &&
		a.bold === b.bold &&
		a.italic === b.italic &&
		a.color === b.color &&
		a.background === b.background
	);
}

function highlightShallowEqual(
	a: HighlightAnnotation,
	b: HighlightAnnotation,
): boolean {
	return (
		a.x1 === b.x1 &&
		a.y1 === b.y1 &&
		a.x2 === b.x2 &&
		a.y2 === b.y2 &&
		a.color === b.color &&
		a.opacity === b.opacity &&
		a.thickness === b.thickness
	);
}

/**
 * 直前の op (last) と新しい op が「同種の update・同 id」のとき、last の prev を
 * 保ったまま next を上書きした merge 済み op を返す。違うときは null。
 * batchKey / タイムスタンプの条件は呼び側 (pushOp) で判定する。
 */
function mergeUpdateOps(
	last: AnnotationOp,
	op: AnnotationOp,
): AnnotationOp | null {
	if (
		last.type === "rect.update" &&
		op.type === "rect.update" &&
		last.id === op.id
	) {
		return { ...last, next: op.next };
	}
	if (
		last.type === "arrow.update" &&
		op.type === "arrow.update" &&
		last.id === op.id
	) {
		return { ...last, next: op.next };
	}
	if (
		last.type === "text.update" &&
		op.type === "text.update" &&
		last.id === op.id
	) {
		return { ...last, next: op.next };
	}
	if (
		last.type === "highlight.update" &&
		op.type === "highlight.update" &&
		last.id === op.id
	) {
		return { ...last, next: op.next };
	}
	return null;
}

function pushOp(
	state: AnnotationHistoryState,
	op: AnnotationOp,
	batchKey: string | null,
	timestamp: number,
): AnnotationHistoryState {
	// merge 判定: 直前の op が同種の update で同 id・同 batchKey、かつ 250ms 以内
	const last = state.cursor >= 0 ? state.ops[state.cursor] : null;
	const merged =
		last !== null &&
		batchKey !== null &&
		state.lastOpBatchKey === batchKey &&
		timestamp - state.lastOpTimestamp < NUDGE_MERGE_WINDOW_MS
			? mergeUpdateOps(last, op)
			: null;

	let nextOps: AnnotationOp[];
	let nextCursor: number;
	if (merged) {
		nextOps = [...state.ops];
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

	// op の種別に応じて rect / arrow / text / highlight いずれかの配列にだけ適用する
	const nextAnnotations =
		isArrowOp(op) || isTextOp(op) || isHighlightOp(op)
			? state.annotations
			: applyForward(state.annotations, op);
	const nextArrows = isArrowOp(op)
		? applyArrowForward(state.arrows, op)
		: state.arrows;
	const nextTexts = isTextOp(op)
		? applyTextForward(state.texts, op)
		: state.texts;
	const nextHighlights = isHighlightOp(op)
		? applyHighlightForward(state.highlights, op)
		: state.highlights;

	return {
		annotations: nextAnnotations,
		arrows: nextArrows,
		texts: nextTexts,
		highlights: nextHighlights,
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
				arrowDefaults: state.arrowDefaults,
				textDefaults: state.textDefaults,
				highlightDefaults: state.highlightDefaults,
			};
		}
		case "SET_ACTIVE_TOOL":
			// 画像がない時に annotation 系ツールは無意味なので強制 crop fallback
			if (state.image.index < 0 && action.tool !== "crop") {
				return { ...state, activeTool: "crop" };
			}
			if (state.activeTool === action.tool) return state;
			return {
				...state,
				activeTool: action.tool,
				// ツール切替時、新しいツールが扱う種類の annotation だけ選択を維持する
				selectedAnnotationId:
					action.tool === "rect"
						? pruneSelection(
								state.selectedAnnotationId,
								state.annotation.annotations,
								[],
								[],
							)
						: action.tool === "arrow"
							? pruneSelection(
									state.selectedAnnotationId,
									[],
									state.annotation.arrows,
									[],
								)
							: action.tool === "text"
								? pruneSelection(
										state.selectedAnnotationId,
										[],
										[],
										state.annotation.texts,
									)
								: action.tool === "highlight"
									? pruneSelection(
											state.selectedAnnotationId,
											[],
											[],
											[],
											state.annotation.highlights,
										)
									: null,
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
		case "SET_ARROW_DEFAULTS":
			return { ...state, arrowDefaults: action.defaults };
		case "ARROW_CREATE": {
			const op: AnnotationOp = {
				type: "arrow.create",
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
		case "ARROW_UPDATE": {
			const prev = state.annotation.arrows.find((a) => a.id === action.id);
			if (!prev) return state;
			const next: ArrowAnnotation = { ...prev, ...action.patch };
			if (arrowShallowEqual(prev, next)) return state;
			const op: AnnotationOp = {
				type: "arrow.update",
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
		case "ARROW_DELETE": {
			const target = state.annotation.arrows.find((a) => a.id === action.id);
			if (!target) return state;
			const op: AnnotationOp = { type: "arrow.delete", annotation: target };
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
		case "SET_TEXT_DEFAULTS":
			return { ...state, textDefaults: action.defaults };
		case "TEXT_CREATE": {
			const op: AnnotationOp = {
				type: "text.create",
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
		case "SET_HIGHLIGHT_DEFAULTS":
			return { ...state, highlightDefaults: action.defaults };
		case "HIGHLIGHT_CREATE": {
			const op: AnnotationOp = {
				type: "highlight.create",
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
		case "TEXT_UPDATE": {
			const prev = state.annotation.texts.find((t) => t.id === action.id);
			if (!prev) return state;
			const next: TextAnnotation = { ...prev, ...action.patch };
			if (textShallowEqual(prev, next)) return state;
			const op: AnnotationOp = {
				type: "text.update",
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
		case "HIGHLIGHT_UPDATE": {
			const prev = state.annotation.highlights.find((a) => a.id === action.id);
			if (!prev) return state;
			const next: HighlightAnnotation = { ...prev, ...action.patch };
			if (highlightShallowEqual(prev, next)) return state;
			const op: AnnotationOp = {
				type: "highlight.update",
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
		case "TEXT_DELETE": {
			const target = state.annotation.texts.find((t) => t.id === action.id);
			if (!target) return state;
			const op: AnnotationOp = { type: "text.delete", annotation: target };
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
		case "HIGHLIGHT_DELETE": {
			const target = state.annotation.highlights.find(
				(a) => a.id === action.id,
			);
			if (!target) return state;
			const op: AnnotationOp = { type: "highlight.delete", annotation: target };
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
			const nextAnnotations =
				isArrowOp(op) || isTextOp(op) || isHighlightOp(op)
					? state.annotation.annotations
					: applyReverse(state.annotation.annotations, op);
			const nextArrows = isArrowOp(op)
				? applyArrowReverse(state.annotation.arrows, op)
				: state.annotation.arrows;
			const nextTexts = isTextOp(op)
				? applyTextReverse(state.annotation.texts, op)
				: state.annotation.texts;
			const nextHighlights = isHighlightOp(op)
				? applyHighlightReverse(state.annotation.highlights, op)
				: state.annotation.highlights;
			return {
				...state,
				annotation: {
					...state.annotation,
					annotations: nextAnnotations,
					arrows: nextArrows,
					texts: nextTexts,
					highlights: nextHighlights,
					cursor: state.annotation.cursor - 1,
					// 直後の連続操作と batch merge されないように batchKey をリセット
					lastOpBatchKey: null,
				},
				selectedAnnotationId: pruneSelection(
					state.selectedAnnotationId,
					nextAnnotations,
					nextArrows,
					nextTexts,
					nextHighlights,
				),
			};
		}
		case "ANNOT_REDO": {
			if (state.annotation.cursor >= state.annotation.ops.length - 1)
				return state;
			const op = state.annotation.ops[state.annotation.cursor + 1];
			const nextAnnotations =
				isArrowOp(op) || isTextOp(op) || isHighlightOp(op)
					? state.annotation.annotations
					: applyForward(state.annotation.annotations, op);
			const nextArrows = isArrowOp(op)
				? applyArrowForward(state.annotation.arrows, op)
				: state.annotation.arrows;
			const nextTexts = isTextOp(op)
				? applyTextForward(state.annotation.texts, op)
				: state.annotation.texts;
			const nextHighlights = isHighlightOp(op)
				? applyHighlightForward(state.annotation.highlights, op)
				: state.annotation.highlights;
			return {
				...state,
				annotation: {
					...state.annotation,
					annotations: nextAnnotations,
					arrows: nextArrows,
					texts: nextTexts,
					highlights: nextHighlights,
					cursor: state.annotation.cursor + 1,
					lastOpBatchKey: null,
				},
				selectedAnnotationId: pruneSelection(
					state.selectedAnnotationId,
					nextAnnotations,
					nextArrows,
					nextTexts,
					nextHighlights,
				),
			};
		}
	}
}

export function SnapcropProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(reducer, initialState, (init) => ({
		...init,
		rectDefaults: loadRectDefaults(),
		arrowDefaults: loadArrowDefaults(),
		textDefaults: loadTextDefaults(),
		highlightDefaults: loadHighlightDefaults(),
	}));
	const cropperRef = useRef<CropEngineHandle | null>(null);
	const rectEngineHandleRef = useRef<RectEngineHandle | null>(null);
	const arrowEngineHandleRef = useRef<ArrowEngineHandle | null>(null);
	const textEngineHandleRef = useRef<TextEngineHandle | null>(null);
	const highlightEngineHandleRef = useRef<HighlightEngineHandle | null>(null);
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

	useEffect(() => {
		saveArrowDefaults(state.arrowDefaults);
	}, [state.arrowDefaults]);

	useEffect(() => {
		saveTextDefaults(state.textDefaults);
	}, [state.textDefaults]);

	useEffect(() => {
		saveHighlightDefaults(state.highlightDefaults);
	}, [state.highlightDefaults]);

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
			loadImageFromBlob: async (blob: Blob, source: ImageSource = "file") => {
				const next = await readImageFromBlob(blob, source);
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

			arrows: state.annotation.arrows,

			arrowDefaults: state.arrowDefaults,
			setArrowDefaults: (defaults) =>
				dispatch({ type: "SET_ARROW_DEFAULTS", defaults }),

			createArrow: (arrow) =>
				dispatch({
					type: "ARROW_CREATE",
					annotation: arrow,
					timestamp: Date.now(),
				}),
			updateArrow: (id, patch, opts) =>
				dispatch({
					type: "ARROW_UPDATE",
					id,
					patch,
					batchKey: opts?.batchKey ?? null,
					timestamp: Date.now(),
				}),
			deleteArrow: (id) =>
				dispatch({ type: "ARROW_DELETE", id, timestamp: Date.now() }),

			texts: state.annotation.texts,

			textDefaults: state.textDefaults,
			setTextDefaults: (defaults) =>
				dispatch({ type: "SET_TEXT_DEFAULTS", defaults }),

			createText: (text) =>
				dispatch({
					type: "TEXT_CREATE",
					annotation: text,
					timestamp: Date.now(),
				}),
			updateText: (id, patch, opts) =>
				dispatch({
					type: "TEXT_UPDATE",
					id,
					patch,
					batchKey: opts?.batchKey ?? null,
					timestamp: Date.now(),
				}),
			deleteText: (id) =>
				dispatch({ type: "TEXT_DELETE", id, timestamp: Date.now() }),

			highlights: state.annotation.highlights,

			highlightDefaults: state.highlightDefaults,
			setHighlightDefaults: (defaults) =>
				dispatch({ type: "SET_HIGHLIGHT_DEFAULTS", defaults }),

			createHighlight: (highlight) =>
				dispatch({
					type: "HIGHLIGHT_CREATE",
					annotation: highlight,
					timestamp: Date.now(),
				}),
			updateHighlight: (id, patch, opts) =>
				dispatch({
					type: "HIGHLIGHT_UPDATE",
					id,
					patch,
					batchKey: opts?.batchKey ?? null,
					timestamp: Date.now(),
				}),
			deleteHighlight: (id) =>
				dispatch({ type: "HIGHLIGHT_DELETE", id, timestamp: Date.now() }),

			rectEngineHandleRef,
			arrowEngineHandleRef,
			textEngineHandleRef,
			highlightEngineHandleRef,
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

async function readImageFromBlob(
	blob: Blob,
	source: ImageSource,
): Promise<LoadedImage> {
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
		fileName: resolveImageFileName(blob, source),
	};
}
