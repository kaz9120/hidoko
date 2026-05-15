import {
	createContext,
	type ReactNode,
	type RefObject,
	use,
	useCallback,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import type { CropData, CropEngineHandle } from "~/hooks/use-crop-engine";

export type { CropData } from "~/hooks/use-crop-engine";

export type LoadedImage = {
	src: string;
	blob: Blob;
	width: number;
	height: number;
	format: string;
	fileSize: number;
};

type SnapcropContextValue = {
	image: LoadedImage | null;
	loadImageFromBlob: (blob: Blob) => Promise<void>;
	clearImage: () => void;
	cropperRef: RefObject<CropEngineHandle | null>;
	/**
	 * 現在のクロップ範囲（画像座標系）。CropEngine から通知された rect を保持し、
	 * ヘッダーの数値表示・ステータスバー両方が購読する。
	 */
	cropData: CropData | null;
	setCropData: (data: CropData | null) => void;
	historyIndex: number;
	historyLength: number;
	canUndo: boolean;
	canRedo: boolean;
	undo: () => void;
	redo: () => void;
};

const SnapcropContext = createContext<SnapcropContextValue | null>(null);

const HISTORY_LIMIT = 50;

type State = {
	history: LoadedImage[];
	index: number;
};

type Action =
	| { type: "LOAD"; image: LoadedImage }
	| { type: "UNDO" }
	| { type: "REDO" }
	| { type: "CLEAR" };

const initialState: State = { history: [], index: -1 };

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "LOAD": {
			// 現在位置より先の履歴 (redo 候補) は破棄され URL を revoke する
			for (const discard of state.history.slice(state.index + 1)) {
				URL.revokeObjectURL(discard.src);
			}
			let next = [...state.history.slice(0, state.index + 1), action.image];
			let nextIndex = next.length - 1;
			while (next.length > HISTORY_LIMIT) {
				const removed = next[0];
				URL.revokeObjectURL(removed.src);
				next = next.slice(1);
				nextIndex -= 1;
			}
			return { history: next, index: nextIndex };
		}
		case "UNDO":
			return state.index > 0 ? { ...state, index: state.index - 1 } : state;
		case "REDO":
			return state.index < state.history.length - 1
				? { ...state, index: state.index + 1 }
				: state;
		case "CLEAR": {
			for (const item of state.history) {
				URL.revokeObjectURL(item.src);
			}
			return initialState;
		}
		default:
			return state;
	}
}

export function SnapcropProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(reducer, initialState);
	const cropperRef = useRef<CropEngineHandle | null>(null);
	const [cropData, setCropData] = useState<CropData | null>(null);

	// `image` の参照差し替え時に setCropData を呼びたい場面が複数ある
	// (新画像ロード / undo / redo)。シグネチャを安定させて子の useEffect 依存を
	// 増やさないために useCallback で固定する。
	const stableSetCropData = useCallback(
		(data: CropData | null) => setCropData(data),
		[],
	);

	const value = useMemo<SnapcropContextValue>(() => {
		const image = state.index >= 0 ? state.history[state.index] : null;

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
			historyIndex: state.index,
			historyLength: state.history.length,
			canUndo: state.index > 0,
			canRedo: state.index < state.history.length - 1,
			undo: () => dispatch({ type: "UNDO" }),
			redo: () => dispatch({ type: "REDO" }),
		};
	}, [state, cropData, stableSetCropData]);

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
