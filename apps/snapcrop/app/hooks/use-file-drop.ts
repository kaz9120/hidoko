import { useEffect, useRef, useState } from "react";

/**
 * document レベルでファイルドラッグを監視し、ドロップされた画像ファイルを
 * onDrop に渡す。複数枚ドロップされた場合は最初の 1 枚だけ採用する。
 *
 * 視覚的なドロップゾーンはこのフックを使う側 (例: EditorCanvas) が isDragging
 * を見て自由に描画する。
 */
export function useFileDrop(onDrop: (file: File) => void) {
	const onDropRef = useRef(onDrop);
	onDropRef.current = onDrop;

	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		// dragenter は子要素をまたぐたびに発火するため、カウンタで「root に
		// 入った」「root から完全に出た」のみを判定する。
		let counter = 0;

		const handleDragEnter = (event: DragEvent) => {
			if (!hasFiles(event)) {
				return;
			}
			event.preventDefault();
			counter += 1;
			setIsDragging(true);
		};

		const handleDragOver = (event: DragEvent) => {
			if (!hasFiles(event)) {
				return;
			}
			event.preventDefault();
		};

		const handleDragLeave = (event: DragEvent) => {
			if (!hasFiles(event)) {
				return;
			}
			event.preventDefault();
			counter -= 1;
			if (counter <= 0) {
				counter = 0;
				setIsDragging(false);
			}
		};

		const handleDrop = (event: DragEvent) => {
			if (!hasFiles(event)) {
				return;
			}
			event.preventDefault();
			counter = 0;
			setIsDragging(false);
			const file = event.dataTransfer?.files[0];
			if (file?.type.startsWith("image/")) {
				onDropRef.current(file);
			}
		};

		document.addEventListener("dragenter", handleDragEnter);
		document.addEventListener("dragover", handleDragOver);
		document.addEventListener("dragleave", handleDragLeave);
		document.addEventListener("drop", handleDrop);

		return () => {
			document.removeEventListener("dragenter", handleDragEnter);
			document.removeEventListener("dragover", handleDragOver);
			document.removeEventListener("dragleave", handleDragLeave);
			document.removeEventListener("drop", handleDrop);
		};
	}, []);

	return isDragging;
}

function hasFiles(event: DragEvent): boolean {
	return event.dataTransfer?.types.includes("Files") ?? false;
}
