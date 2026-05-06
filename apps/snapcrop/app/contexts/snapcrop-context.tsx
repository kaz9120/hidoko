import type Cropper from "cropperjs";
import {
	createContext,
	type ReactNode,
	type RefObject,
	use,
	useMemo,
	useReducer,
	useRef,
} from "react";

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
	cropperRef: RefObject<Cropper | null>;
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
	const cropperRef = useRef<Cropper | null>(null);

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
			canUndo: state.index > 0,
			canRedo: state.index < state.history.length - 1,
			undo: () => dispatch({ type: "UNDO" }),
			redo: () => dispatch({ type: "REDO" }),
		};
	}, [state]);

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
