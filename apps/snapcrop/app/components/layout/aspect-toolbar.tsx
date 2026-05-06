import { RotateCwSquareIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Toggle } from "~/components/shadcn-ui/toggle";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "~/components/shadcn-ui/toggle-group";
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

	const handleAspectChange = (next: string) => {
		// ToggleGroup type="single" は同じ項目を再クリックすると "" になるので
		// 常に何かしら選択された状態を保つために空文字を弾く
		if (!next) {
			return;
		}
		const found = ASPECT_RATIOS.find((r) => r.id === next);
		if (!found) {
			return;
		}
		setSelectedId(found.id);
		cropperRef.current?.setAspectRatio(effectiveRatio(found.ratio, isPortrait));
	};

	const handleOrientationToggle = (pressed: boolean) => {
		setIsPortrait(pressed);
		const current = ASPECT_RATIOS.find((r) => r.id === selectedId);
		if (current) {
			cropperRef.current?.setAspectRatio(
				effectiveRatio(current.ratio, pressed),
			);
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-3 border-border border-t bg-card px-5 py-3">
			<span
				className="shrink-0 text-muted-foreground text-sm"
				id="aspect-label"
			>
				アスペクト比:
			</span>
			<Toggle
				aria-label={isPortrait ? "横向きに切り替え" : "縦向きに切り替え"}
				onPressedChange={handleOrientationToggle}
				pressed={isPortrait}
				size="sm"
				title={isPortrait ? "横向きに切り替え" : "縦向きに切り替え"}
				variant="outline"
			>
				<RotateCwSquareIcon strokeWidth={1.75} />
			</Toggle>
			<ToggleGroup
				aria-labelledby="aspect-label"
				onValueChange={handleAspectChange}
				type="single"
				value={selectedId}
				variant="outline"
			>
				{ASPECT_RATIOS.map((aspect) => (
					<ToggleGroupItem
						key={aspect.id}
						size="sm"
						title={aspect.title}
						value={aspect.id}
					>
						{aspect.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}
