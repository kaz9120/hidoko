import {
	CameraIcon,
	ClipboardIcon,
	FolderOpenIcon,
	type LucideIcon,
	MonitorIcon,
} from "lucide-react";
import { useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { readImageFromClipboard } from "~/lib/clipboard";

export function InputSidebar() {
	const { loadImageFromBlob } = useSnapcrop();
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	return (
		<aside className="hidden w-72 shrink-0 overflow-y-auto border-border border-r bg-card md:block">
			<div className="border-border border-b p-5">
				<h2 className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
					画像を取得
				</h2>
				<div className="flex flex-col gap-2.5">
					<InputMethodButton
						Icon={MonitorIcon}
						description="画面をキャプチャ"
						disabled
						name="スクリーンショット"
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
						disabled
						name="カメラ"
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
