import {
	CameraIcon,
	DownloadIcon,
	type LucideIcon,
	PencilIcon,
} from "lucide-react";

export type MobileTabId = "input" | "editor" | "export";

type MobileTab = {
	id: MobileTabId;
	label: string;
	Icon: LucideIcon;
};

const MOBILE_TABS: MobileTab[] = [
	{ id: "input", label: "入力", Icon: CameraIcon },
	{ id: "editor", label: "編集", Icon: PencilIcon },
	{ id: "export", label: "出力", Icon: DownloadIcon },
];

type MobileTabsProps = {
	active: MobileTabId;
	onChange: (next: MobileTabId) => void;
};

export function MobileTabs({ active, onChange }: MobileTabsProps) {
	return (
		<nav className="sticky bottom-0 z-30 flex shrink-0 items-stretch border-border border-t bg-card md:hidden">
			{MOBILE_TABS.map(({ id, label, Icon }) => {
				const isActive = id === active;
				return (
					<button
						aria-current={isActive ? "page" : undefined}
						className={`flex flex-1 flex-col items-center justify-center gap-1 px-3 py-2.5 transition-colors ${
							isActive ? "text-primary" : "text-muted-foreground"
						}`}
						key={id}
						onClick={() => onChange(id)}
						type="button"
					>
						<Icon size={18} strokeWidth={1.75} />
						<span className="text-xs">{label}</span>
					</button>
				);
			})}
		</nav>
	);
}
