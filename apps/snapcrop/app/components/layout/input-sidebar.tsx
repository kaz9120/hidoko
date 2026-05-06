import {
	CameraIcon,
	ClipboardIcon,
	FolderOpenIcon,
	type LucideIcon,
	MonitorIcon,
} from "lucide-react";
import { useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";

type InputMethod = {
	id: string;
	name: string;
	description: string;
	Icon: LucideIcon;
	disabled?: boolean;
};

const PLACEHOLDER_METHODS: InputMethod[] = [
	{
		id: "screenshot",
		name: "スクリーンショット",
		description: "画面をキャプチャ",
		Icon: MonitorIcon,
		disabled: true,
	},
	{
		id: "paste",
		name: "クリップボード",
		description: "画像を貼り付け",
		Icon: ClipboardIcon,
		disabled: true,
	},
	{
		id: "camera",
		name: "カメラ",
		description: "写真を撮影",
		Icon: CameraIcon,
		disabled: true,
	},
];

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

	return (
		<aside className="hidden w-72 shrink-0 overflow-y-auto border-border border-r bg-card md:block">
			<div className="border-border border-b p-5">
				<h2 className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
					画像を取得
				</h2>
				<div className="flex flex-col gap-2.5">
					<button
						className="flex items-center gap-4 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary hover:bg-muted"
						onClick={handleUploadClick}
						type="button"
					>
						<span className="flex size-10 shrink-0 items-center justify-center text-primary">
							<FolderOpenIcon size={20} strokeWidth={1.75} />
						</span>
						<span className="flex flex-col gap-0.5">
							<span className="font-medium text-foreground text-sm">
								ファイルアップロード
							</span>
							<span className="text-muted-foreground text-xs">画像を選択</span>
						</span>
					</button>
					{PLACEHOLDER_METHODS.map(
						({ id, name, description, Icon, disabled }) => (
							<button
								className="flex items-center gap-4 rounded-lg border border-border bg-background p-4 text-left opacity-50 transition-colors"
								disabled={disabled}
								key={id}
								type="button"
							>
								<span className="flex size-10 shrink-0 items-center justify-center text-muted-foreground">
									<Icon size={20} strokeWidth={1.75} />
								</span>
								<span className="flex flex-col gap-0.5">
									<span className="font-medium text-foreground text-sm">
										{name}
									</span>
									<span className="text-muted-foreground text-xs">
										{description}
									</span>
								</span>
							</button>
						),
					)}
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
