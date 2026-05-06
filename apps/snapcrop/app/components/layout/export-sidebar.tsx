import { CopyIcon, DownloadIcon, type LucideIcon } from "lucide-react";

type ExportOption = {
	id: string;
	title: string;
	description: string;
	Icon: LucideIcon;
};

const EXPORT_OPTIONS: ExportOption[] = [
	{
		id: "download",
		title: "ダウンロード",
		description: "PNG形式で保存",
		Icon: DownloadIcon,
	},
	{
		id: "clipboard",
		title: "クリップボード",
		description: "画像をコピー",
		Icon: CopyIcon,
	},
];

export function ExportSidebar() {
	return (
		<aside className="hidden w-72 shrink-0 overflow-y-auto border-border border-l bg-card md:block">
			<div className="border-border border-b p-5">
				<h2 className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
					エクスポート
				</h2>
				<div className="flex flex-col gap-2.5">
					{EXPORT_OPTIONS.map(({ id, title, description, Icon }) => (
						<button
							className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 text-left opacity-50"
							disabled
							key={id}
							type="button"
						>
							<div className="flex items-center gap-3">
								<span className="text-muted-foreground">
									<Icon size={18} strokeWidth={1.75} />
								</span>
								<span className="font-medium text-foreground text-sm">
									{title}
								</span>
							</div>
							<span className="text-muted-foreground text-xs">
								{description}
							</span>
						</button>
					))}
				</div>
			</div>

			<div className="p-5">
				<h2 className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
					画像情報
				</h2>
				<dl className="flex flex-col gap-2 text-sm">
					<div className="flex items-baseline justify-between gap-4">
						<dt className="text-muted-foreground">サイズ:</dt>
						<dd className="text-foreground/60">—</dd>
					</div>
					<div className="flex items-baseline justify-between gap-4">
						<dt className="text-muted-foreground">ファイルサイズ:</dt>
						<dd className="text-foreground/60">—</dd>
					</div>
					<div className="flex items-baseline justify-between gap-4">
						<dt className="text-muted-foreground">形式:</dt>
						<dd className="text-foreground/60">—</dd>
					</div>
				</dl>
			</div>
		</aside>
	);
}
