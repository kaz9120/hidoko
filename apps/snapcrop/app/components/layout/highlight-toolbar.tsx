import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "ui";
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
 * マーカーツール選択中だけ現れる 38px の context row。「次に引くマーカーの
 * デフォルト」を編集する。選択中のマーカーのプロパティ編集は bbox 近傍の
 * フローティング (HighlightFloatingToolbar / #147 Phase 3) に集約されているので
 * こちらには出てこない。
 *
 * コントロールは「色 (蛍光 5 色)・線の質感・不透明度スライダー・太さ 3 段階」。
 * 色は矩形・矢印の共通プリセットとは別の蛍光パレット
 * (HIGHLIGHT_PRESET_COLORS) を ColorSwatches に差し替えて使う。
 */
export function HighlightToolbar() {
	const {
		image,
		activeTool,
		highlights,
		highlightDefaults,
		setHighlightDefaults,
	} = useSnapcrop();

	if (!image || activeTool !== "highlight") {
		return null;
	}

	const commit = (patch: Partial<HighlightDefaults>) => {
		setHighlightDefaults({ ...highlightDefaults, ...patch });
	};

	return (
		<HighlightToolbarView
			current={highlightDefaults}
			highlightCount={highlights.length}
			onCommit={commit}
		/>
	);
}

export type HighlightToolbarViewProps = {
	current: HighlightDefaults;
	highlightCount: number;
	onCommit: (patch: Partial<HighlightDefaults>) => void;
};

/**
 * HighlightToolbar の見た目だけを担う props 駆動 view。Storybook から状態を
 * 注入して検証できるよう、context 接続部 (HighlightToolbar) と分離している
 * (ArrowToolbar / ZoomControl / StatusBar の先例に同じ)。
 */
export function HighlightToolbarView({
	current,
	highlightCount,
	onCommit,
}: HighlightToolbarViewProps) {
	const opacityPercent = Math.round(current.opacity * 100);

	return (
		<div
			aria-label="マーカーツールのプロパティ"
			className="flex h-[38px] shrink-0 items-center gap-2.5 border-border border-b bg-[var(--bg-overlay)] px-3.5"
			role="toolbar"
		>
			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.08em] uppercase">
				マーカー
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
					onCommit({ opacity: next / 100 });
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
