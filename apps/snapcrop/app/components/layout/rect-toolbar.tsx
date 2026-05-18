import {
	Grid2X2Icon,
	PlusIcon,
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
import { useSnapcrop } from "~/contexts/snapcrop-context";
import {
	PRESET_COLORS,
	type RectDefaults,
	type RectStyle,
	type RectThickness,
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

	const current: { style: RectStyle; color: string; thickness: RectThickness } =
		selected
			? {
					style: selected.style,
					color: selected.color,
					thickness: selected.thickness,
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

			<Label>色</Label>
			<ColorSwatches
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

function ColorSwatches({
	value,
	onChange,
	disabled,
}: {
	value: string;
	onChange: (next: string) => void;
	disabled: boolean;
}) {
	return (
		<div
			className="inline-flex items-center gap-1.5 px-1"
			style={{ opacity: disabled ? 0.35 : 1 }}
		>
			{PRESET_COLORS.map((c) => {
				const active = value.toLowerCase() === c.toLowerCase();
				return (
					<button
						aria-pressed={active}
						aria-label={`色 ${c}`}
						className={`size-[18px] cursor-pointer rounded-full border-[1.5px] p-0 transition-transform not-disabled:hover:scale-110 disabled:cursor-not-allowed ${
							active
								? "border-foreground shadow-[0_0_0_1.5px_var(--background)]"
								: "border-transparent"
						}`}
						disabled={disabled}
						key={c}
						onClick={() => onChange(c)}
						style={{ background: c }}
						type="button"
					/>
				);
			})}
			<Tooltip>
				<TooltipTrigger asChild>
					{/* aria-disabled で「無効だが Tooltip / focus は機能する」状態に。
					    native disabled だと pointer event を受けないので Tooltip が出ない。 */}
					<button
						aria-disabled="true"
						aria-label="カスタム色 (近日対応)"
						className="inline-flex size-[18px] cursor-not-allowed items-center justify-center rounded-full border-[1.5px] border-transparent p-0"
						onClick={(e) => e.preventDefault()}
						style={{
							background:
								"conic-gradient(from 0deg, #f44, #fa3, #fd0, #4d4, #4af, #94f, #f4a, #f44)",
						}}
						type="button"
					>
						<PlusIcon className="size-2.5 text-black/60" strokeWidth={2.5} />
					</button>
				</TooltipTrigger>
				<TooltipContent>近日対応</TooltipContent>
			</Tooltip>
		</div>
	);
}
