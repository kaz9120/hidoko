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
import { RectColorSwatches } from "~/components/layout/rect-color-swatches";
import { StrokeStyleIcon } from "~/components/layout/stroke-style-icon";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import type {
	RectDefaults,
	RectStrokeStyle,
	RectThickness,
} from "~/lib/rect-engine";

// 確定仕様 (snapcrop 新デザイン 最終版 / FinalSpec) の段階導入:
//   - PR #159 で「塗り」スタイルを廃止
//   - 本 PR でモザイクを独立ツール (activeTool === "mosaic") に分離
// これで矩形ツールは「枠線専用」となり、スタイルセグメントは UI から消える。
// モザイク選択中の操作は MosaicToolbar が引き取る。

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
 * 矩形は「枠線専用」(Issue #146 で塗り廃止 + モザイク独立化)。
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
		color: string;
		thickness: RectThickness;
		strokeStyle: RectStrokeStyle;
	} = selected
		? {
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
				aria-label="線の質感"
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
				disabled={false}
				onChange={(color) => commit({ color })}
				value={current.color}
			/>

			<Divider />

			<Label>太さ</Label>
			<ToggleGroup
				aria-label="太さ"
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
