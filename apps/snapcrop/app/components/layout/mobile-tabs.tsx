import {
	CameraIcon,
	DownloadIcon,
	type LucideIcon,
	PencilIcon,
} from "lucide-react";

type MobileTab = {
	id: "input" | "editor" | "export";
	label: string;
	Icon: LucideIcon;
};

const MOBILE_TABS: MobileTab[] = [
	{ id: "input", label: "入力", Icon: CameraIcon },
	{ id: "editor", label: "編集", Icon: PencilIcon },
	{ id: "export", label: "出力", Icon: DownloadIcon },
];

export function MobileTabs() {
	return (
		<nav className="sticky bottom-0 z-30 flex shrink-0 items-stretch border-border border-t bg-card md:hidden">
			{MOBILE_TABS.map(({ id, label, Icon }) => (
				<button
					className="flex flex-1 flex-col items-center justify-center gap-1 px-3 py-2.5 text-muted-foreground opacity-50"
					disabled
					key={id}
					type="button"
				>
					<Icon size={18} strokeWidth={1.75} />
					<span className="text-xs">{label}</span>
				</button>
			))}
		</nav>
	);
}
