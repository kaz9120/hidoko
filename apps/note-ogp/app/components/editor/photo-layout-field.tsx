import { ToggleGroup, ToggleGroupItem } from "ui";
import { Field, FieldDescription, FieldLabel } from "ui/components/field";
import { cn } from "ui/lib/utils";
import type {
	Fields,
	FocalPoint,
	PhotoLayout,
	TemplateDef,
} from "~/lib/og-templates";
import { FOCAL_POINTS, PHOTO_LAYOUTS } from "~/lib/og-templates";

const LAYOUT_NOTES: Record<PhotoLayout, string> = {
	full: "四辺いっぱいに裁ち落とす（現行の構図）",
	edge: "片側 2/3 に裁ち落とし、反対側はテキスト面",
	kakuhan: "角版＋四周に地余白（額縁効果）",
};

const FOCAL_LABELS: Record<FocalPoint, string> = {
	"top-left": "左上",
	top: "上",
	"top-right": "右上",
	left: "左",
	center: "中央",
	right: "右",
	"bottom-left": "左下",
	bottom: "下",
	"bottom-right": "右下",
};

/**
 * 写真の配置型・左右入れ替え・注視点（9 点グリッド）の選択 UI。
 * - 配置型と左右入れ替えは Cover 専用（Quiet の角版は固定構図）
 * - 注視点は写真をクロップするテンプレ（Cover / Quiet）で共通。
 *   写真がないあいだは操作ごと無効化する
 */
export function PhotoLayoutField({
	state,
	update,
	tpl,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	tpl: TemplateDef;
}) {
	if (tpl.useImage === false) return null;
	const isCover = tpl.id === "cover";
	const hasImage = !!state.image;

	return (
		<div className="mt-3.5">
			{isCover && (
				<Field className="mb-3.5">
					<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
						写真の配置
					</FieldLabel>
					<ToggleGroup
						type="single"
						variant="outline"
						value={state.photoLayout}
						onValueChange={(v) => {
							if (v) update({ photoLayout: v as PhotoLayout });
						}}
						className="w-full"
					>
						{PHOTO_LAYOUTS.map((l) => (
							<ToggleGroupItem key={l.id} value={l.id} className="flex-1">
								{l.label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
					{state.photoLayout === "edge" && (
						<ToggleGroup
							type="single"
							variant="outline"
							value={state.photoMirror ? "right" : "left"}
							onValueChange={(v) => {
								if (v) update({ photoMirror: v === "right" });
							}}
							className="w-full"
						>
							<ToggleGroupItem value="left" className="flex-1">
								写真は左
							</ToggleGroupItem>
							<ToggleGroupItem value="right" className="flex-1">
								写真は右
							</ToggleGroupItem>
						</ToggleGroup>
					)}
					<FieldDescription>
						{state.photoLayout === "edge"
							? `${LAYOUT_NOTES.edge}。視線の先に余白がくる側へ`
							: LAYOUT_NOTES[state.photoLayout]}
					</FieldDescription>
				</Field>
			)}

			<Field className="mb-3.5">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					注視点
				</FieldLabel>
				<div className="grid w-[132px] grid-cols-3 gap-1 rounded-md border border-border bg-background p-1.5">
					{FOCAL_POINTS.map((fp) => {
						const active = state.focalPoint === fp;
						return (
							<button
								key={fp}
								type="button"
								aria-pressed={active}
								aria-label={`注視点: ${FOCAL_LABELS[fp]}`}
								title={FOCAL_LABELS[fp]}
								disabled={!hasImage}
								onClick={() => update({ focalPoint: fp })}
								className={cn(
									"flex h-6 items-center justify-center rounded-[3px] transition-colors",
									active ? "bg-primary/15" : "hover:bg-muted",
									!hasImage && "cursor-not-allowed opacity-40",
								)}
							>
								<span
									className={cn(
										"size-1.5 rounded-full",
										active ? "bg-primary" : "bg-muted-foreground/50",
									)}
								/>
							</button>
						);
					})}
				</div>
				<FieldDescription>
					{hasImage
						? "写真の主役の位置。トリミングが追従する"
						: "写真を追加すると選べる"}
				</FieldDescription>
			</Field>
		</div>
	);
}
