import { RotateCwSquareIcon } from "lucide-react";
import {
	type ChangeEvent,
	type KeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { Toggle, ToggleGroup, ToggleGroupItem } from "ui";
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
};

const ASPECT_RATIOS: AspectRatio[] = [
	{ id: "free", label: "自由", title: "自由選択", ratio: null },
	{ id: "1:1", label: "1:1", title: "正方形", ratio: 1 },
	{ id: "16:9", label: "16:9", title: "ワイド", ratio: 16 / 9 },
	{ id: "4:3", label: "4:3", title: "クラシック", ratio: 4 / 3 },
	{ id: "4:5", label: "4:5", title: "インスタ投稿", ratio: 4 / 5 },
	{ id: "phi", label: "φ", title: "黄金比 (1.618:1)", ratio: 1.618 },
	{ id: "sqrt2", label: "√2", title: "白銀比 (1.414:1)", ratio: Math.SQRT2 },
	{ id: "3:2", label: "3:2", title: "写真", ratio: 3 / 2 },
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

/**
 * クロップツール選択中だけ現れる 38px の context row。W×H 数値入力、向き反転、
 * アスペクト比プリセットを並べる。状態 (selectedRatio / isPortrait) は
 * SnapcropContext に持たせており、ツール切替で値が消えない。
 */
export function CropToolbar() {
	const {
		image,
		activeTool,
		cropData,
		cropperRef,
		cropAspectRatioId,
		setCropAspectRatioId,
		cropIsPortrait,
		setCropIsPortrait,
	} = useSnapcrop();

	if (!image || activeTool !== "crop") {
		return null;
	}

	const cropWidth = cropData ? Math.round(cropData.width) : 0;
	const cropHeight = cropData ? Math.round(cropData.height) : 0;

	const handleAspectChange = (next: string) => {
		if (!next) return;
		const found = ASPECT_RATIOS.find((r) => r.id === next);
		if (!found) return;
		setCropAspectRatioId(found.id);
		cropperRef.current?.setAspectRatio(
			effectiveRatio(found.ratio, cropIsPortrait),
		);
	};

	const handleOrientationToggle = (pressed: boolean) => {
		setCropIsPortrait(pressed);
		const current = ASPECT_RATIOS.find((r) => r.id === cropAspectRatioId);
		if (current) {
			cropperRef.current?.setAspectRatio(
				effectiveRatio(current.ratio, pressed),
			);
		}
	};

	const setCropSize = (next: { width?: number; height?: number }) => {
		cropperRef.current?.setData(next);
	};

	return (
		<div
			aria-label="クロップツールのプロパティ"
			className="flex h-[38px] shrink-0 items-center gap-2.5 border-border border-b bg-[var(--bg-overlay)] px-3.5"
			role="toolbar"
		>
			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.08em] uppercase">
				クロップ
			</span>

			<Divider />

			<NumberField
				axis="w"
				onCommit={(n) => setCropSize({ width: n })}
				value={cropWidth}
			/>
			<span
				aria-hidden="true"
				className="font-mono text-muted-foreground text-xs"
			>
				×
			</span>
			<NumberField
				axis="h"
				onCommit={(n) => setCropSize({ height: n })}
				value={cropHeight}
			/>

			<Divider />

			<Toggle
				aria-label={cropIsPortrait ? "横向きに切り替え" : "縦向きに切り替え"}
				onPressedChange={handleOrientationToggle}
				pressed={cropIsPortrait}
				size="sm"
				title={cropIsPortrait ? "横向きに切り替え" : "縦向きに切り替え"}
				variant="outline"
			>
				<RotateCwSquareIcon strokeWidth={1.75} />
			</Toggle>
			<ToggleGroup
				aria-label="アスペクト比"
				onValueChange={handleAspectChange}
				type="single"
				value={cropAspectRatioId}
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

function Divider() {
	return (
		<span aria-hidden="true" className="h-[18px] w-px shrink-0 bg-border" />
	);
}

/**
 * フォーカス中はユーザーの入力をそのまま保持し、blur / Enter で確定する数値入力。
 * フォーカスが外れているときだけ親から渡された value で同期する (cropper の
 * crop イベントによる値変化に追従させる)。
 */
function NumberField({
	axis,
	value,
	onCommit,
}: {
	axis: "w" | "h";
	value: number;
	onCommit: (next: number) => void;
}) {
	const [draft, setDraft] = useState(String(value));
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (document.activeElement !== ref.current) {
			setDraft(String(value));
		}
	}, [value]);

	const commit = () => {
		const n = Number.parseInt(draft, 10);
		if (Number.isFinite(n) && n > 0) {
			onCommit(n);
		} else {
			setDraft(String(value));
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.currentTarget.blur();
		} else if (event.key === "Escape") {
			setDraft(String(value));
			event.currentTarget.blur();
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setDraft(e.target.value);
	};

	return (
		<input
			aria-label={axis === "w" ? "クロップ幅 (px)" : "クロップ高さ (px)"}
			className="h-7 w-14 rounded-sm border border-border bg-input/30 px-2 text-right font-mono text-foreground text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
			inputMode="numeric"
			onBlur={commit}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			ref={ref}
			type="text"
			value={draft}
		/>
	);
}
