import { RotateCwSquareIcon } from "lucide-react";
import { Button } from "~/components/shadcn-ui/button";

type AspectRatio = {
	id: string;
	label: string;
	title: string;
	ratio: number | null;
	group: "free" | "standard" | "social" | "design";
};

const ASPECT_RATIOS: AspectRatio[] = [
	{ id: "free", label: "自由", title: "自由選択", ratio: null, group: "free" },
	{ id: "1:1", label: "1:1", title: "正方形", ratio: 1, group: "standard" },
	{
		id: "16:9",
		label: "16:9",
		title: "ワイド",
		ratio: 16 / 9,
		group: "standard",
	},
	{
		id: "4:3",
		label: "4:3",
		title: "クラシック",
		ratio: 4 / 3,
		group: "standard",
	},
	{
		id: "4:5",
		label: "4:5",
		title: "インスタ投稿",
		ratio: 4 / 5,
		group: "social",
	},
	{
		id: "phi",
		label: "φ",
		title: "黄金比 (1.618:1)",
		ratio: 1.618,
		group: "design",
	},
	{
		id: "sqrt2",
		label: "√2",
		title: "白銀比 (1.414:1)",
		ratio: Math.SQRT2,
		group: "design",
	},
	{ id: "3:2", label: "3:2", title: "写真", ratio: 3 / 2, group: "design" },
];

export function AspectToolbar() {
	return (
		<div className="flex flex-wrap items-center gap-3 border-border border-t bg-card px-5 py-3">
			<span className="shrink-0 text-muted-foreground text-sm">
				アスペクト比:
			</span>
			<Button
				aria-label="縦横切り替え"
				disabled
				size="icon-sm"
				title="縦横切り替え"
				variant="outline"
			>
				<RotateCwSquareIcon strokeWidth={1.75} />
			</Button>
			<div className="flex flex-wrap items-center gap-1.5">
				{ASPECT_RATIOS.map(({ id, label, title }) => (
					<Button
						className="px-3"
						disabled
						key={id}
						size="sm"
						title={title}
						variant={id === "free" ? "secondary" : "ghost"}
					>
						{label}
					</Button>
				))}
			</div>
		</div>
	);
}
