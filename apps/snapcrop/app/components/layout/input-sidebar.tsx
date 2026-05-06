import {
	CameraIcon,
	ClipboardIcon,
	FolderOpenIcon,
	type LucideIcon,
	MonitorIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { CameraDialog } from "~/components/camera-dialog";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { readImageFromClipboard } from "~/lib/clipboard";
import { captureScreen, isScreenCaptureSupported } from "~/lib/screen-capture";

type InputSidebarProps = {
	mobileVisible: boolean;
};

export function InputSidebar({ mobileVisible }: InputSidebarProps) {
	const { loadImageFromBlob } = useSnapcrop();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [cameraOpen, setCameraOpen] = useState(false);
	const [isCapturing, setIsCapturing] = useState(false);
	const screenshotSupported = isScreenCaptureSupported();

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}
		await loadImageFromBlob(file);
		event.target.value = "";
	};

	const handleClipboardClick = async () => {
		const blob = await readImageFromClipboard();
		if (blob) {
			await loadImageFromBlob(blob);
		}
	};

	const handleScreenshotClick = async () => {
		if (isCapturing) {
			return;
		}
		setIsCapturing(true);
		try {
			const blob = await captureScreen();
			if (blob) {
				await loadImageFromBlob(blob);
			}
		} finally {
			setIsCapturing(false);
		}
	};

	return (
		<aside
			className={`${mobileVisible ? "flex" : "hidden"} w-full shrink-0 flex-col overflow-y-auto border-border bg-card md:flex md:w-72 md:border-r`}
		>
			<div className="border-border border-b p-5">
				<h2 className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
					画像を取得
				</h2>
				<div className="flex flex-col gap-2.5">
					<InputMethodButton
						Icon={MonitorIcon}
						description={
							screenshotSupported
								? isCapturing
									? "キャプチャ中..."
									: "画面をキャプチャ"
								: "このブラウザでは利用不可"
						}
						disabled={!screenshotSupported || isCapturing}
						name="スクリーンショット"
						onClick={handleScreenshotClick}
					/>
					<InputMethodButton
						Icon={FolderOpenIcon}
						description="画像を選択"
						name="ファイルアップロード"
						onClick={handleUploadClick}
					/>
					<InputMethodButton
						Icon={ClipboardIcon}
						description="画像を貼り付け (Ctrl+V も可)"
						name="クリップボード"
						onClick={handleClipboardClick}
					/>
					<InputMethodButton
						Icon={CameraIcon}
						description="写真を撮影"
						name="カメラ"
						onClick={() => setCameraOpen(true)}
					/>
				</div>
			</div>
			<input
				accept="image/*"
				className="hidden"
				onChange={handleFileChange}
				ref={fileInputRef}
				type="file"
			/>
			<CameraDialog
				onCaptured={(blob) => {
					void loadImageFromBlob(blob);
				}}
				onOpenChange={setCameraOpen}
				open={cameraOpen}
			/>
		</aside>
	);
}

function InputMethodButton({
	Icon,
	name,
	description,
	onClick,
	disabled = false,
}: {
	Icon: LucideIcon;
	name: string;
	description: string;
	onClick?: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			className={`flex items-center gap-4 rounded-lg border border-border bg-background p-4 text-left transition-colors ${
				disabled ? "opacity-50" : "hover:border-primary hover:bg-muted"
			}`}
			disabled={disabled}
			onClick={onClick}
			type="button"
		>
			<span
				className={`flex size-10 shrink-0 items-center justify-center ${
					disabled ? "text-muted-foreground" : "text-primary"
				}`}
			>
				<Icon size={20} strokeWidth={1.75} />
			</span>
			<span className="flex flex-col gap-0.5">
				<span className="font-medium text-foreground text-sm">{name}</span>
				<span className="text-muted-foreground text-xs">{description}</span>
			</span>
		</button>
	);
}
