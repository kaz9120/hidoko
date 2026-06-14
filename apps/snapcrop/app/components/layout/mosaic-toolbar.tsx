import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "ui";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import type { RectDefaults, RectThickness } from "~/lib/rect-engine";

const BLOCK_OPTIONS: ReadonlyArray<{ id: RectThickness; label: string }> = [
	{ id: "sm", label: "細" },
	{ id: "md", label: "中" },
	{ id: "lg", label: "粗" },
];

/**
 * モザイクツール選択中だけ現れる 38px の context row (Issue #146)。「次に描く
 * モザイクのデフォルト」(ブロック粒度) を編集する。選択中のモザイクの編集は
 * 矩形と同じく bbox 近傍のフローティング (RectFloatingToolbar / #147 Phase 3)
 * に集約されているのでこちらには出てこない。
 *
 * 内部の data 構造は当面 RectAnnotation.style === "mosaic" のまま (UI 上の独立化が
 * 先で、型の分離は後続 PR)。色や線の質感はモザイクには効かない。
 */
export function MosaicToolbar() {
	const { image, activeTool, annotations, rectDefaults, setRectDefaults } =
		useSnapcrop();

	if (!image || activeTool !== "mosaic") {
		return null;
	}

	const commit = (patch: Partial<RectDefaults>) => {
		setRectDefaults({ ...rectDefaults, ...patch });
	};

	const mosaicCount = annotations.filter((a) => a.style === "mosaic").length;

	return (
		<div
			aria-label="モザイクツールのプロパティ"
			className="flex h-[38px] shrink-0 items-center gap-2.5 border-border border-b bg-[var(--bg-overlay)] px-3.5"
			role="toolbar"
		>
			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.08em] uppercase">
				モザイク
			</span>
			<Divider />

			<Label>ブロック</Label>
			<ToggleGroup
				aria-label="ブロックの粒度"
				onValueChange={(next) => {
					if (next) commit({ thickness: next as RectThickness });
				}}
				type="single"
				value={rectDefaults.thickness}
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
