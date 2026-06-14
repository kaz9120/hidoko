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
import { useSnapcrop } from "~/contexts/snapcrop-context";
import type { RectDefaults, RectThickness } from "~/lib/rect-engine";

const BLOCK_OPTIONS: ReadonlyArray<{ id: RectThickness; label: string }> = [
	{ id: "sm", label: "細" },
	{ id: "md", label: "中" },
	{ id: "lg", label: "粗" },
];

/**
 * モザイクツール選択中だけ現れる 38px の context row (Issue #146)。
 * モザイクは独立ツールに分離したので、矩形のスタイル選択 (枠線 / 塗り / モザイク)
 * からは外れた。ここでは「ブロックの粒度」(= RectAnnotation.thickness を
 * MOSAIC_PX で引いた値) だけを扱う。色や線の質感はモザイクには効かない。
 *
 * 内部の data 構造は当面 RectAnnotation.style === "mosaic" のまま (UI 上の独立化が
 * 先で、型の分離は後続 PR)。selection があるとき、選択中の annotation が
 * mosaic スタイルなら反映する。
 */
export function MosaicToolbar() {
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

	if (!image || activeTool !== "mosaic") {
		return null;
	}

	// モザイク選択中は、style === "mosaic" の annotation のみ対象。それ以外は
	// rect-toolbar 側で扱う (ただしモザイクツール中は rect-toolbar は出ない)。
	const selected = selectedAnnotationId
		? (annotations.find(
				(a) => a.id === selectedAnnotationId && a.style === "mosaic",
			) ?? null)
		: null;

	const current: { thickness: RectThickness } = selected
		? { thickness: selected.thickness }
		: { thickness: rectDefaults.thickness };

	const commit = (patch: Partial<RectDefaults>) => {
		if (selected) {
			updateAnnotation(selected.id, patch);
		} else {
			setRectDefaults({ ...rectDefaults, ...patch });
		}
	};

	const mosaicCount = annotations.filter((a) => a.style === "mosaic").length;

	return (
		<div
			aria-label="モザイクツールのプロパティ"
			className="flex h-[38px] shrink-0 items-center gap-2.5 border-border border-b bg-[var(--bg-overlay)] px-3.5"
			role="toolbar"
		>
			<span
				className={`font-mono text-[10px] tracking-[0.08em] uppercase ${
					selected ? "text-[var(--accent)]" : "text-muted-foreground"
				}`}
			>
				{selected ? "選択中" : "モザイク"}
			</span>
			<Divider />

			<Label>ブロック</Label>
			<ToggleGroup
				aria-label="ブロックの粒度"
				onValueChange={(next) => {
					if (next) commit({ thickness: next as RectThickness });
				}}
				type="single"
				value={current.thickness}
				variant="outline"
			>
				{BLOCK_OPTIONS.map((opt) => (
					<ToggleGroupItem
						key={opt.id}
						size="sm"
						title={`ブロック: ${opt.label}`}
						value={opt.id}
					>
						<span>{opt.label}</span>
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<div className="flex-1" />

			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.04em]">
				{mosaicCount} 個のモザイク
			</span>

			{selected && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							aria-label="選択中のモザイクを削除"
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
