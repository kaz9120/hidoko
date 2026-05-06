/**
 * navigator.mediaDevices.getDisplayMedia が利用可能か判定する。
 * モバイルブラウザでは概ね非対応のため、UI 側で disabled にする目的で使う。
 */
export function isScreenCaptureSupported(): boolean {
	return (
		typeof navigator !== "undefined" &&
		typeof navigator.mediaDevices?.getDisplayMedia === "function"
	);
}

/**
 * 画面キャプチャを 1 枚撮って PNG Blob を返す。
 * - キャンセル / 権限拒否 / API 非対応では null
 * - stream は撮影後すぐ stop する (track を残すと「画面共有中」表示が消えない)
 *
 * 必ずユーザーのクリックなどジェスチャー内で呼び出すこと。
 */
export async function captureScreen(): Promise<Blob | null> {
	if (!isScreenCaptureSupported()) {
		return null;
	}

	let stream: MediaStream | null = null;
	try {
		stream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
			audio: false,
		});
		return await captureStreamFrame(stream);
	} catch {
		return null;
	} finally {
		if (stream) {
			for (const track of stream.getTracks()) {
				track.stop();
			}
		}
	}
}

async function captureStreamFrame(stream: MediaStream): Promise<Blob> {
	const video = document.createElement("video");
	video.srcObject = stream;
	video.muted = true;
	video.playsInline = true;

	await video.play();
	if (video.readyState < 2) {
		await new Promise<void>((resolve) => {
			video.addEventListener("loadeddata", () => resolve(), { once: true });
		});
	}

	const canvas = document.createElement("canvas");
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Canvas 2D context not available");
	}
	ctx.drawImage(video, 0, 0);

	return await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error("Failed to encode screenshot"));
			}
		}, "image/png");
	});
}
