import { CameraIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/shadcn-ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/shadcn-ui/dialog";

type CameraDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCaptured: (blob: Blob) => void;
};

export function CameraDialog({
	open,
	onOpenChange,
	onCaptured,
}: CameraDialogProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		if (!open) {
			setIsReady(false);
			setError(null);
			return;
		}

		let cancelled = false;
		let stream: MediaStream | null = null;

		(async () => {
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "environment" },
				});
				if (cancelled) {
					for (const track of stream.getTracks()) {
						track.stop();
					}
					return;
				}
				const video = videoRef.current;
				if (video) {
					video.srcObject = stream;
					await video.play();
					setIsReady(true);
				}
			} catch (err) {
				if (cancelled) {
					return;
				}
				const name = err instanceof Error ? err.name : "";
				setError(
					name === "NotAllowedError"
						? "カメラへのアクセスが拒否されました"
						: "カメラの起動に失敗しました",
				);
			}
		})();

		return () => {
			cancelled = true;
			if (stream) {
				for (const track of stream.getTracks()) {
					track.stop();
				}
			}
			const video = videoRef.current;
			if (video) {
				video.srcObject = null;
			}
		};
	}, [open]);

	const handleCapture = () => {
		const video = videoRef.current;
		if (!video || !isReady) {
			return;
		}
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}
		ctx.drawImage(video, 0, 0);
		canvas.toBlob((blob) => {
			if (blob) {
				onCaptured(blob);
				onOpenChange(false);
			}
		}, "image/png");
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>カメラ撮影</DialogTitle>
					<DialogDescription>
						プレビューを確認してから「撮影」を押す。Esc でキャンセルできる。
					</DialogDescription>
				</DialogHeader>
				<div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
					{error ? (
						<div className="flex h-full items-center justify-center p-8 text-center text-destructive">
							{error}
						</div>
					) : (
						<video
							aria-label="カメラのプレビュー"
							className="h-full w-full object-cover"
							muted
							playsInline
							ref={videoRef}
						>
							<track kind="captions" />
						</video>
					)}
				</div>
				<DialogFooter>
					<Button onClick={() => onOpenChange(false)} variant="outline">
						キャンセル
					</Button>
					<Button disabled={!isReady || error !== null} onClick={handleCapture}>
						<CameraIcon strokeWidth={1.75} />
						撮影
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
