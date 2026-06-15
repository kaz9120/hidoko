import { RotateCwSquareIcon } from "lucide-react";
import {
	type ChangeEvent,
	type KeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { Toggle, ToggleGroup, ToggleGroupItem } from "ui";
import { FloatingToolbar } from "~/components/canvas/floating-toolbar";
import type { CropEngineHandle } from "~/hooks/use-crop-engine";
import type { CropRect } from "~/lib/crop-engine";

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

type Props = {
	cropRect: CropRect;
	cropperRef: React.RefObject<CropEngineHandle | null>;
	aspectRatioId: string;
	onAspectRatioIdChange: (id: string) => void;
	isPortrait: boolean;
	onPortraitChange: (portrait: boolean) => void;
};

/**
 * クロップ HUD (#147 Phase 3 / 上部固定版)。比率 8 種、縦横反転、W×H 数値入力を
 * 描画領域の上部中央に固定で出す。共通 FloatingToolbar の上部固定スタイルに
 * 乗っているので、画像位置に関係なく常に同じ場所に見える。
 *
 * 補助アクション (中央寄せ・全画面・リセット) は ⌘A 等のショートカットに
 * 任せて UI からは省く。確定/× も live update のため不要。
 */
export function CropFloatingToolbar({
	cropRect,
	cropperRef,
	aspectRatioId,
	onAspectRatioIdChange,
	isPortrait,
	onPortraitChange,
}: Props) {
	const cropWidth = Math.round(cropRect.width);
	const cropHeight = Math.round(cropRect.height);

	const handleAspectChange = (next: string) => {
		if (!next) return;
		const found = ASPECT_RATIOS.find((r) => r.id === next);
		if (!found) return;
		onAspectRatioIdChange(found.id);
		cropperRef.current?.setAspectRatio(effectiveRatio(found.ratio, isPortrait));
	};

	const handleOrientationToggle = (pressed: boolean) => {
		onPortraitChange(pressed);
		const current = ASPECT_RATIOS.find((r) => r.id === aspectRatioId);
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
		<FloatingToolbar>
			<ToggleGroup
				aria-label="アスペクト比"
				onValueChange={handleAspectChange}
				type="single"
				value={aspectRatioId}
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
		</FloatingToolbar>
	);
}

/**
 * フォーカス中はユーザーの入力をそのまま保持し、blur / Enter で確定する数値入力。
 * フォーカスが外れているときだけ親から渡された value で同期する (cropper の
 * crop イベントによる値変化に追従させる)。crop-toolbar から移植した実装。
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
