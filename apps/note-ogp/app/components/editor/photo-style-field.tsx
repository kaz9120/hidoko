import { ToggleGroup, ToggleGroupItem } from "ui";
import { Field, FieldDescription, FieldLabel } from "ui/components/field";
import type {
	Fields,
	PhotoFilter,
	TemplateDef,
	TextGuard,
} from "~/lib/og-templates";
import { PHOTO_FILTERS, TEXT_GUARDS } from "~/lib/og-templates";

const FILTER_NOTES: Record<PhotoFilter, string> = {
	none: "撮ったままの色で載せる",
	awaku: "明度を上げ彩度を抜いて、余白感を出す",
	kukkiri: "コントラストと彩度をひと押しだけ",
	mono: "モノクロで質感を立てる",
	vignette: "四隅を落として中央に視線を集める",
};

const GUARD_NOTES: Record<TextGuard, string> = {
	scrim: "下からのグラデーションで沈める（現行）",
	band: "端まで届く不透明の帯。確実に読ませる",
	box: "タイトル背面だけに半透明の面を敷く",
	overlay: "全面にテーマ色を薄く重ねる",
};

/**
 * 写真の加工プリセットとテキスト保護方式の選択 UI。
 * - 加工は写真を使う全テンプレ・全配置型に効く。さじ加減は固定プリセットで、
 *   スライダーは出さない（盛りすぎを構造的に防ぐ）
 * - 保護方式は「写真の上に文字が乗る」Cover の全面配置でだけ表示する。
 *   片寄せ・角版はテキストが色面側にあり保護が不要なため、選択肢ごと出さない
 */
export function PhotoStyleField({
	state,
	update,
	tpl,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	tpl: TemplateDef;
}) {
	if (tpl.useImage === false) return null;
	const hasImage = !!state.image;
	const showGuard = tpl.id === "cover" && state.photoLayout === "full";

	return (
		<>
			<Field className="mb-3.5">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					写真の加工
				</FieldLabel>
				<ToggleGroup
					type="single"
					variant="outline"
					value={state.photoFilter}
					disabled={!hasImage}
					onValueChange={(v) => {
						if (v) update({ photoFilter: v as PhotoFilter });
					}}
					className="w-full"
				>
					{PHOTO_FILTERS.map((p) => (
						<ToggleGroupItem
							key={p.id}
							value={p.id}
							className="flex-1 px-1 text-xs"
						>
							{p.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<FieldDescription>
					{hasImage
						? FILTER_NOTES[state.photoFilter]
						: "写真を追加すると選べる"}
				</FieldDescription>
			</Field>

			{showGuard && (
				<Field className="mb-3.5">
					<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
						文字の保護
					</FieldLabel>
					<ToggleGroup
						type="single"
						variant="outline"
						value={state.textGuard}
						onValueChange={(v) => {
							if (v) update({ textGuard: v as TextGuard });
						}}
						className="w-full"
					>
						{TEXT_GUARDS.map((g) => (
							<ToggleGroupItem
								key={g.id}
								value={g.id}
								className="flex-1 px-1 text-xs"
							>
								{g.label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
					<FieldDescription>{GUARD_NOTES[state.textGuard]}</FieldDescription>
				</Field>
			)}
		</>
	);
}
