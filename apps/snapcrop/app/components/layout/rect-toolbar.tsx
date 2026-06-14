import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "ui";
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
//   - PR #173 でモザイクを独立ツール (activeTool === "mosaic") に分離
//   - 本 PR で選択中の矩形編集はフローティング (#147 Phase 3) に集約。
//     画面上端の 2 段目バーは「次に描く矩形のデフォルト」だけを扱う。
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
 * 矩形ツール選択中だけ現れる 38px の context row。次に描く矩形の defaults を
 * 編集する。選択中の矩形のプロパティは bbox 近傍のフローティング
 * (RectFloatingToolbar) で扱うのでこちらには出てこない。
 */
export function RectToolbar() {
	const { image, activeTool, annotations, rectDefaults, setRectDefaults } =
		useSnapcrop();

	if (!image || activeTool !== "rect") {
		return null;
	}

	const commit = (patch: Partial<RectDefaults>) => {
		setRectDefaults({ ...rectDefaults, ...patch });
	};

	return (
		<div
			aria-label="矩形ツールのプロパティ"
			className="flex h-[38px] shrink-0 items-center gap-2.5 border-border border-b bg-[var(--bg-overlay)] px-3.5"
			role="toolbar"
		>
			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.08em] uppercase">
				矩形
			</span>
			<Divider />

			<ToggleGroup
				aria-label="線の質感"
				onValueChange={(next) => {
					if (next) commit({ strokeStyle: next as RectStrokeStyle });
				}}
				type="single"
				value={rectDefaults.strokeStyle}
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
				value={rectDefaults.color}
			/>

			<Divider />

			<Label>太さ</Label>
			<ToggleGroup
				aria-label="太さ"
				onValueChange={(next) => {
					if (next) commit({ thickness: next as RectThickness });
				}}
				type="single"
				value={rectDefaults.thickness}
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
