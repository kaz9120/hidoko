import { Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";
import {
	Button,
	ToggleGroup,
	ToggleGroupItem,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "ui";
import { Slider } from "ui/components/slider";
import { ColorSwatches } from "~/components/layout/color-swatches";
import { StrokeStyleIcon } from "~/components/layout/stroke-style-icon";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import {
	HIGHLIGHT_MAX_OPACITY,
	HIGHLIGHT_MIN_OPACITY,
	HIGHLIGHT_PRESET_COLORS,
	type HighlightDefaults,
	type HighlightStrokeStyle,
	type HighlightThickness,
} from "~/lib/highlight-engine";

const THICKNESS_OPTIONS: ReadonlyArray<{
	id: HighlightThickness;
	label: string;
	barHeight: number;
}> = [
	{ id: "sm", label: "細", barHeight: 3 },
	{ id: "md", label: "中", barHeight: 5 },
	{ id: "lg", label: "太", barHeight: 8 },
];

const STROKE_STYLE_OPTIONS: ReadonlyArray<{
	id: HighlightStrokeStyle;
	label: string;
}> = [
	{ id: "clean", label: "きっちり" },
	{ id: "sketchy", label: "手書き" },
];

/**
 * マーカーツール選択中だけ現れる 38px の context row。arrow-toolbar.tsx の
 * 先例に揃える: selection があればそのハイライトのプロパティを反映し変更も
 * ハイライトに書き戻す。selection なしのときは highlightDefaults を反映し、
 * 変更が次に引くハイライトのデフォルトになる。
 *
 * コントロールは「色 (蛍光 5 色)・不透明度スライダー・太さ 3 段階」。
 * 色は矩形・矢印の共通プリセットとは別の蛍光パレット
 * (HIGHLIGHT_PRESET_COLORS) を ColorSwatches に差し替えて使う。
 */
export function HighlightToolbar() {
	const {
		image,
		activeTool,
		highlights,
		selectedAnnotationId,
		deleteHighlight,
		highlightDefaults,
		setHighlightDefaults,
		updateHighlight,
	} = useSnapcrop();

	if (!image || activeTool !== "highlight") {
		return null;
	}

	const selected = selectedAnnotationId
		? (highlights.find((h) => h.id === selectedAnnotationId) ?? null)
		: null;

	const current: HighlightDefaults = selected
		? {
				color: selected.color,
				opacity: selected.opacity,
				thickness: selected.thickness,
				strokeStyle: selected.strokeStyle,
			}
		: highlightDefaults;

	const commit = (patch: Partial<HighlightDefaults>, batchKey?: string) => {
		if (selected) {
			updateHighlight(selected.id, patch, batchKey ? { batchKey } : undefined);
		} else {
			setHighlightDefaults({ ...highlightDefaults, ...patch });
		}
	};

	return (
		<HighlightToolbarView
			current={current}
			highlightCount={highlights.length}
			onCommit={commit}
			onDelete={selected ? () => deleteHighlight(selected.id) : undefined}
			selected={selected !== null}
		/>
	);
}

export type HighlightToolbarViewProps = {
	current: HighlightDefaults;
	/** true なら「選択中」表示になり、onDelete の削除ボタンが出る。 */
	selected: boolean;
	highlightCount: number;
	onCommit: (patch: Partial<HighlightDefaults>, batchKey?: string) => void;
	onDelete?: () => void;
};

/**
 * HighlightToolbar の見た目だけを担う props 駆動 view。Storybook から状態を
 * 注入して検証できるよう、context 接続部 (HighlightToolbar) と分離している
 * (ArrowToolbar / ZoomControl / StatusBar の先例に同じ)。
 */
export function HighlightToolbarView({
	current,
	selected,
	highlightCount,
	onCommit,
	onDelete,
}: HighlightToolbarViewProps) {
	const opacityPercent = Math.round(current.opacity * 100);

	return (
		<div
			aria-label="マーカーツールのプロパティ"
			className="flex h-[38px] shrink-0 items-center gap-2.5 border-border border-b bg-[var(--bg-overlay)] px-3.5"
			role="toolbar"
		>
			<span
				className={`font-mono text-[10px] tracking-[0.08em] uppercase ${
					selected ? "text-[var(--accent)]" : "text-muted-foreground"
				}`}
			>
				{selected ? "選択中" : "マーカー"}
			</span>
			<Divider />

			<Label>色</Label>
			<ColorSwatches
				colors={HIGHLIGHT_PRESET_COLORS}
				onChange={(color) => onCommit({ color })}
				value={current.color}
			/>

			<Divider />

			<ToggleGroup
				aria-label="線の質感"
				onValueChange={(next) => {
					if (next) onCommit({ strokeStyle: next as HighlightStrokeStyle });
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

			<Label>不透明度</Label>
			<Slider
				aria-label="不透明度"
				className="w-24"
				max={HIGHLIGHT_MAX_OPACITY * 100}
				min={HIGHLIGHT_MIN_OPACITY * 100}
				onValueChange={([next]) => {
					// スライダードラッグ中の連続変更は 1 履歴にまとめる
					onCommit({ opacity: next / 100 }, "opacity");
				}}
				step={5}
				value={[opacityPercent]}
			/>
			<span className="w-9 font-mono text-[11px] text-muted-foreground tabular-nums">
				{opacityPercent}%
			</span>

			<Divider />

			<Label>太さ</Label>
			<ToggleGroup
				aria-label="太さ"
				onValueChange={(next) => {
					if (next) onCommit({ thickness: next as HighlightThickness });
				}}
				type="single"
				value={current.thickness}
				variant="outline"
			>
				{THICKNESS_OPTIONS.map((opt) => (
					<ToggleGroupItem
						aria-label={`太さ: ${opt.label}`}
						key={opt.id}
						size="sm"
						title={`太さ: ${opt.label}`}
						value={opt.id}
					>
						<span
							className="block w-3.5 rounded-[1px] bg-current opacity-60"
							style={{ height: opt.barHeight }}
						/>
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<div className="flex-1" />

			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.04em]">
				{highlightCount} 本のマーカー
			</span>

			{selected && onDelete && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							aria-label="選択中のマーカーを削除"
							onClick={onDelete}
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
