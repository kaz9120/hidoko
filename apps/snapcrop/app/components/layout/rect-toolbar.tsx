import {
	Grid2X2Icon,
	SquareIcon,
	SquareStackIcon,
	Trash2Icon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
	Button,
	ToggleGroup,
	ToggleGroupItem,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "ui";
import { RectColorSwatches } from "~/components/layout/rect-color-swatches";
import { StrokeStyleIcon } from "~/components/layout/stroke-style-icon";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import type {
	RectDefaults,
	RectStrokeStyle,
	RectStyle,
	RectThickness,
} from "~/lib/rect-engine";

const STYLE_OPTIONS: ReadonlyArray<{
	id: RectStyle;
	label: string;
	icon: typeof SquareIcon;
}> = [
	{ id: "outline", label: "枠線", icon: SquareIcon },
	{ id: "fill", label: "塗り", icon: SquareStackIcon },
	{ id: "mosaic", label: "モザイク", icon: Grid2X2Icon },
];

const STROKE_STYLE_OPTIONS: ReadonlyArray<{
	id: RectStrokeStyle;
	label: string;
}> = [
	{ id: "clean", label: "きっちり" },
	{ id: "sketchy", label: "手書き" },
];

const THICKNESS_OPTIONS: ReadonlyArray<{
	id: RectThickness;
	barHeight: number;
}> = [
	{ id: "sm", barHeight: 1 },
	{ id: "md", barHeight: 2.5 },
	{ id: "lg", barHeight: 5 },
];

/**
 * 矩形ツール選択中だけ現れる 38px の context row。selection があればその矩形の
 * プロパティを反映し変更も矩形に書き戻す。selection なしのときは
 * rectDefaults を反映し、変更が次に描く矩形のデフォルトになる。
 *
 * style によって他コントロールの enable / disable が変わる:
 *   - fill   : thickness は disabled (ラベルは「太さ」のまま)
 *   - mosaic : color は disabled、thickness ラベルは「ブロック」
 *
 * style / thickness のセグメント表示はクロップ側のアスペクト比と同じ ui の
 * ToggleGroup を使う (見た目を統一)。色スウォッチだけは円形 + ブランドカラー
 * の都合で自前。
 */
export function RectToolbar() {
	const {
		image,
		activeTool,
		annotations,
		selectedAnnotationId,
		deleteAnnotation,
		rectDefaults,
		setRectDefaults,
		updateAnnotation,
	} = useSnapcrop();

	if (!image || activeTool !== "rect") {
		return null;
	}

	const selected = selectedAnnotationId
		? (annotations.find((a) => a.id === selectedAnnotationId) ?? null)
		: null;

	const current: {
		style: RectStyle;
		color: string;
		thickness: RectThickness;
		strokeStyle: RectStrokeStyle;
	} = selected
		? {
				style: selected.style,
				color: selected.color,
				thickness: selected.thickness,
				strokeStyle: selected.strokeStyle,
			}
		: rectDefaults;

	const commit = (patch: Partial<RectDefaults>) => {
		if (selected) {
			updateAnnotation(selected.id, patch);
		} else {
			setRectDefaults({ ...rectDefaults, ...patch });
		}
	};

	const colorDisabled = current.style === "mosaic";
	const thicknessDisabled = current.style === "fill";
	const thicknessLabel = current.style === "mosaic" ? "ブロック" : "太さ";
	// 枠線スタイル (clean / sketchy) は outline だけに効く。fill / mosaic では
	// 枠線が無いので、disable して「効かない」ことを UI でも見せる。
	const strokeStyleDisabled = current.style !== "outline";

	return (
		<div
			aria-label="矩形ツールのプロパティ"
			className="flex h-[38px] shrink-0 items-center gap-2.5 border-border border-b bg-[var(--bg-overlay)] px-3.5"
			role="toolbar"
		>
			<span
				className={`font-mono text-[10px] tracking-[0.08em] uppercase ${
					selected ? "text-[var(--accent)]" : "text-muted-foreground"
				}`}
			>
				{selected ? "選択中" : "矩形"}
			</span>
			<Divider />

			<ToggleGroup
				aria-label="矩形スタイル"
				onValueChange={(next) => {
					if (next) commit({ style: next as RectStyle });
				}}
				type="single"
				value={current.style}
				variant="outline"
			>
				{STYLE_OPTIONS.map((opt) => {
					const Icon = opt.icon;
					return (
						<ToggleGroupItem
							key={opt.id}
							size="sm"
							title={opt.label}
							value={opt.id}
						>
							<Icon strokeWidth={1.75} />
							<span>{opt.label}</span>
						</ToggleGroupItem>
					);
				})}
			</ToggleGroup>

			<Divider />

			<ToggleGroup
				aria-label="線の質感"
				disabled={strokeStyleDisabled}
				onValueChange={(next) => {
					if (next) commit({ strokeStyle: next as RectStrokeStyle });
				}}
				type="single"
				value={current.strokeStyle}
				variant="outline"
			>
				{STROKE_STYLE_OPTIONS.map((opt) => (
					<ToggleGroupItem
						key={opt.id}
						size="sm"
						title={opt.label}
						value={opt.id}
					>
						<StrokeStyleIcon style={opt.id} />
						<span>{opt.label}</span>
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<Divider />

			<Label>色</Label>
			<RectColorSwatches
				disabled={colorDisabled}
				onChange={(color) => commit({ color })}
				value={current.color}
			/>

			<Divider />

			<Label>{thicknessLabel}</Label>
			<ToggleGroup
				aria-label="太さ"
				disabled={thicknessDisabled}
				onValueChange={(next) => {
					if (next) commit({ thickness: next as RectThickness });
				}}
				type="single"
				value={current.thickness}
				variant="outline"
			>
				{THICKNESS_OPTIONS.map((opt) => (
					<ToggleGroupItem
						key={opt.id}
						size="sm"
						title={`太さ ${opt.id}`}
						value={opt.id}
					>
						<span
							className="block w-3.5 rounded-[1px] bg-current"
							style={{ height: opt.barHeight }}
						/>
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<div className="flex-1" />

			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.04em]">
				{annotations.length} 個の図形
			</span>

			{selected && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							aria-label="選択中の矩形を削除"
							onClick={() => deleteAnnotation(selected.id)}
							size="icon-sm"
							variant="ghost"
						>
							<Trash2Icon strokeWidth={1.75} />
						</Button>
					</TooltipTrigger>
					<TooltipContent>削除 (⌫)</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
}

function Divider() {
	return (
		<span aria-hidden="true" className="h-[18px] w-px shrink-0 bg-border" />
	);
}

function Label({ children }: { children: ReactNode }) {
	return (
		<span className="font-mono text-[11px] text-muted-foreground">
			{children}
		</span>
	);
}
