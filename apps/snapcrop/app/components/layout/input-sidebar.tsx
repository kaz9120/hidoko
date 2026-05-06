import {
	CameraIcon,
	ClipboardIcon,
	FolderOpenIcon,
	type LucideIcon,
	MonitorIcon,
} from "lucide-react";

type InputMethod = {
	id: string;
	name: string;
	description: string;
	Icon: LucideIcon;
};

const INPUT_METHODS: InputMethod[] = [
	{
		id: "screenshot",
		name: "スクリーンショット",
		description: "画面をキャプチャ",
		Icon: MonitorIcon,
	},
	{
		id: "upload",
		name: "ファイルアップロード",
		description: "画像を選択",
		Icon: FolderOpenIcon,
	},
	{
		id: "paste",
		name: "クリップボード",
		description: "画像を貼り付け",
		Icon: ClipboardIcon,
	},
	{
		id: "camera",
		name: "カメラ",
		description: "写真を撮影",
		Icon: CameraIcon,
	},
];

export function InputSidebar() {
	return (
		<aside className="hidden w-72 shrink-0 overflow-y-auto border-border border-r bg-card md:block">
			<div className="border-border border-b p-5">
				<h2 className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
					画像を取得
				</h2>
				<div className="flex flex-col gap-2.5">
					{INPUT_METHODS.map(({ id, name, description, Icon }) => (
						<button
							className="flex items-center gap-4 rounded-lg border border-border bg-background p-4 text-left opacity-50 transition-colors"
							disabled
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
					))}
				</div>
			</div>
		</aside>
	);
}
