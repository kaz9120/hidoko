import type Cropper from "cropperjs";
import {
	createContext,
	type ReactNode,
	type RefObject,
	use,
	useRef,
	useState,
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
};

const SnapcropContext = createContext<SnapcropContextValue | null>(null);

export function SnapcropProvider({ children }: { children: ReactNode }) {
	const [image, setImage] = useState<LoadedImage | null>(null);
	const cropperRef = useRef<Cropper | null>(null);

	const loadImageFromBlob = async (blob: Blob) => {
		const next = await readImageFromBlob(blob);
		setImage((prev) => {
			if (prev) {
				URL.revokeObjectURL(prev.src);
			}
			return next;
		});
	};

	const clearImage = () => {
		setImage((prev) => {
			if (prev) {
				URL.revokeObjectURL(prev.src);
			}
			return null;
		});
	};

	return (
		<SnapcropContext.Provider
			value={{ image, loadImageFromBlob, clearImage, cropperRef }}
		>
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
