import { RotateCwSquareIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/shadcn-ui/button";
import { useSnapcrop } from "~/contexts/snapcrop-context";

type AspectRatio = {
	id: string;
	label: string;
	title: string;
	/**
	 * 横長を基準とした比率。null は自由選択 (NaN) を意味する。1 (正方形) と null
	 * は portrait モードでも値が変わらないので effectiveRatio で特別扱いする。
	 */
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

function effectiveRatio(ratio: number | null, isPortrait: boolean): number {
	if (ratio === null) {
		return Number.NaN;
	}
	if (ratio === 1) {
		return 1;
	}
	return isPortrait ? 1 / ratio : ratio;
}

export function AspectToolbar() {
	const { image, cropperRef } = useSnapcrop();
	const [selectedId, setSelectedId] = useState<string>("free");
	const [isPortrait, setIsPortrait] = useState(false);

	// 画像が差し替わったら自由 + 横向きにリセット。image の値そのものは使わず、
	// 識別子の変化だけを購読する意図的な「effect-as-event」パターン。
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional change-detection
	useEffect(() => {
		setSelectedId("free");
		setIsPortrait(false);
	}, [image]);

	if (!image) {
		return null;
	}

	const handleAspectClick = (next: AspectRatio) => {
		setSelectedId(next.id);
		cropperRef.current?.setAspectRatio(effectiveRatio(next.ratio, isPortrait));
	};

	const handleOrientationToggle = () => {
		const nextPortrait = !isPortrait;
		setIsPortrait(nextPortrait);
		const current = ASPECT_RATIOS.find((r) => r.id === selectedId);
		if (current) {
			cropperRef.current?.setAspectRatio(
				effectiveRatio(current.ratio, nextPortrait),
			);
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-3 border-border border-t bg-card px-5 py-3">
			<span className="shrink-0 text-muted-foreground text-sm">
				アスペクト比:
			</span>
			<Button
				aria-label="縦横切り替え"
				aria-pressed={isPortrait}
				className={isPortrait ? "border-primary text-primary" : undefined}
				onClick={handleOrientationToggle}
				size="icon-sm"
				title={isPortrait ? "横向きに切り替え" : "縦向きに切り替え"}
				variant="outline"
			>
				<RotateCwSquareIcon strokeWidth={1.75} />
			</Button>
			<div className="flex flex-wrap items-center gap-1.5">
				{ASPECT_RATIOS.map((aspect) => (
					<Button
						className="px-3"
						key={aspect.id}
						onClick={() => handleAspectClick(aspect)}
						size="sm"
						title={aspect.title}
						variant={selectedId === aspect.id ? "secondary" : "ghost"}
					>
						{aspect.label}
					</Button>
				))}
			</div>
		</div>
	);
}
