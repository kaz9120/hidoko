import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BanIcon,
	CircleIcon,
	MoveUpRightIcon,
	SplineIcon,
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
import { ColorSwatches } from "~/components/layout/color-swatches";
import { StrokeStyleIcon } from "~/components/layout/stroke-style-icon";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import type {
	ArrowCapStyle,
	ArrowDefaults,
	ArrowLineStyle,
	ArrowStrokeStyle,
	ArrowThickness,
} from "~/lib/arrow-engine";

const LINE_OPTIONS: ReadonlyArray<{
	id: ArrowLineStyle;
	label: string;
	icon: typeof MoveUpRightIcon;
}> = [
	{ id: "straight", label: "直線", icon: MoveUpRightIcon },
	{ id: "curve", label: "曲線", icon: SplineIcon },
];

const CAP_OPTIONS: ReadonlyArray<{
	id: ArrowCapStyle;
	label: string;
}> = [
	{ id: "none", label: "なし" },
	{ id: "arrow", label: "矢印" },
	{ id: "dot", label: "丸" },
];

const STYLE_OPTIONS: ReadonlyArray<{
	id: ArrowStrokeStyle;
	label: string;
}> = [
	{ id: "clean", label: "きっちり" },
	{ id: "sketchy", label: "手書き" },
];

const THICKNESS_OPTIONS: ReadonlyArray<{
	id: ArrowThickness;
	label: string;
	barHeight: number;
}> = [
	{ id: "sm", label: "細", barHeight: 1.5 },
	{ id: "md", label: "中", barHeight: 3 },
	{ id: "lg", label: "太", barHeight: 6 },
];

function capIcon(side: "start" | "end", style: ArrowCapStyle) {
	if (style === "none") return BanIcon;
	if (style === "dot") return CircleIcon;
	return side === "start" ? ArrowLeftIcon : ArrowRightIcon;
}

/**
 * 矢印ツール選択中だけ現れる 38px の context row。rect-toolbar.tsx の先例に
 * 揃える: selection があればその矢印のプロパティを反映し変更も矢印に書き戻す。
 * selection なしのときは arrowDefaults を反映し、変更が次に描く矢印の
 * デフォルトになる。
 *
 * コントロールは「線形 (直線 / 曲線)・始点キャップ・終点キャップ・色・太さ」。
 * 色は矩形と共通のプリセット 6 色 (ColorSwatches)。
 */
export function ArrowToolbar() {
	const {
		image,
		activeTool,
		arrows,
		selectedAnnotationId,
		deleteArrow,
		arrowDefaults,
		setArrowDefaults,
		updateArrow,
	} = useSnapcrop();

	if (!image || activeTool !== "arrow") {
		return null;
	}

	const selected = selectedAnnotationId
		? (arrows.find((a) => a.id === selectedAnnotationId) ?? null)
		: null;

	const current: ArrowDefaults = selected
		? {
				line: selected.line,
				startCap: selected.startCap,
				endCap: selected.endCap,
				color: selected.color,
				thickness: selected.thickness,
				style: selected.style,
			}
		: arrowDefaults;

	const commit = (patch: Partial<ArrowDefaults>) => {
		if (selected) {
			updateArrow(selected.id, patch);
		} else {
			setArrowDefaults({ ...arrowDefaults, ...patch });
		}
	};

	return (
		<ArrowToolbarView
			arrowCount={arrows.length}
			current={current}
			onCommit={commit}
			onDelete={selected ? () => deleteArrow(selected.id) : undefined}
			selected={selected !== null}
		/>
	);
}

export type ArrowToolbarViewProps = {
	current: ArrowDefaults;
	/** true なら「選択中」表示になり、onDelete の削除ボタンが出る。 */
	selected: boolean;
	arrowCount: number;
	onCommit: (patch: Partial<ArrowDefaults>) => void;
	onDelete?: () => void;
};

/**
 * ArrowToolbar の見た目だけを担う props 駆動 view。Storybook から状態を
 * 注入して検証できるよう、context 接続部 (ArrowToolbar) と分離している
 * (ZoomControl / StatusBar の先例に同じ)。
 */
export function ArrowToolbarView({
	current,
	selected,
	arrowCount,
	onCommit,
	onDelete,
}: ArrowToolbarViewProps) {
	return (
		<div
			aria-label="矢印ツールのプロパティ"
			className="flex h-[38px] shrink-0 items-center gap-2.5 border-border border-b bg-[var(--bg-overlay)] px-3.5"
			role="toolbar"
		>
			<span
				className={`font-mono text-[10px] tracking-[0.08em] uppercase ${
					selected ? "text-[var(--accent)]" : "text-muted-foreground"
				}`}
			>
				{selected ? "選択中" : "矢印"}
			</span>
			<Divider />

			<ToggleGroup
				aria-label="線形"
				onValueChange={(next) => {
					if (next) onCommit({ line: next as ArrowLineStyle });
				}}
				type="single"
				value={current.line}
				variant="outline"
			>
				{LINE_OPTIONS.map((opt) => {
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
				onValueChange={(next) => {
					if (next) onCommit({ style: next as ArrowStrokeStyle });
				}}
				type="single"
				value={current.style}
				variant="outline"
			>
				{STYLE_OPTIONS.map((opt) => (
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

			<Label>始点</Label>
			<ToggleGroup
				aria-label="始点のスタイル"
				onValueChange={(next) => {
					if (next) onCommit({ startCap: next as ArrowCapStyle });
				}}
				type="single"
				value={current.startCap}
				variant="outline"
			>
				{CAP_OPTIONS.map((opt) => {
					const Icon = capIcon("start", opt.id);
					return (
						<ToggleGroupItem
							aria-label={`始点: ${opt.label}`}
							key={opt.id}
							size="sm"
							title={`始点: ${opt.label}`}
							value={opt.id}
						>
							<Icon strokeWidth={1.75} />
						</ToggleGroupItem>
					);
				})}
			</ToggleGroup>

			<Label>終点</Label>
			<ToggleGroup
				aria-label="終点のスタイル"
				onValueChange={(next) => {
					if (next) onCommit({ endCap: next as ArrowCapStyle });
				}}
				type="single"
				value={current.endCap}
				variant="outline"
			>
				{CAP_OPTIONS.map((opt) => {
					const Icon = capIcon("end", opt.id);
					return (
						<ToggleGroupItem
							aria-label={`終点: ${opt.label}`}
							key={opt.id}
							size="sm"
							title={`終点: ${opt.label}`}
							value={opt.id}
						>
							<Icon strokeWidth={1.75} />
						</ToggleGroupItem>
					);
				})}
			</ToggleGroup>

			<Divider />

			<Label>色</Label>
			<ColorSwatches
				onChange={(color) => onCommit({ color })}
				value={current.color}
			/>

			<Divider />

			<Label>太さ</Label>
			<ToggleGroup
				aria-label="太さ"
				onValueChange={(next) => {
					if (next) onCommit({ thickness: next as ArrowThickness });
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
							className="block w-3.5 rounded-[1px] bg-current"
							style={{ height: opt.barHeight }}
						/>
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<div className="flex-1" />

			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.04em]">
				{arrowCount} 本の矢印
			</span>

			{selected && onDelete && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							aria-label="選択中の矢印を削除"
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
