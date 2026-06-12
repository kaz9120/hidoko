import { ToggleGroup, ToggleGroupItem } from "ui";
import { Field, FieldDescription, FieldLabel } from "ui/components/field";
import type { Fields, TitleDecoration } from "~/lib/og-templates";

const DESCRIPTIONS: Record<TitleDecoration, string> = {
	none: "加工なし。さじ加減は固定プリセット",
	merihari: "助詞を少し小さくして、名詞を立てる",
	zurashi: "行頭を半文字ずつずらす。複数行で効く",
	hanzure: "差し色のフチを少しずらして重ねる",
};

/**
 * タイトル装飾の選択 UI。4 択の固定プリセットだけを出し、
 * 自由なシャドウ・グラデーション設定は提供しない（盛りすぎを構造的に防ぐ）。
 */
export function TitleDecorationField({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	return (
		<Field className="mb-3.5">
			<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
				タイトルの装飾
			</FieldLabel>
			<ToggleGroup
				type="single"
				variant="outline"
				value={state.titleDecoration}
				onValueChange={(v) => {
					if (v) update({ titleDecoration: v as TitleDecoration });
				}}
				className="w-full"
			>
				<ToggleGroupItem value="none" className="flex-1">
					なし
				</ToggleGroupItem>
				<ToggleGroupItem value="merihari" className="flex-1">
					メリハリ
				</ToggleGroupItem>
				<ToggleGroupItem value="zurashi" className="flex-1">
					行ずらし
				</ToggleGroupItem>
				<ToggleGroupItem value="hanzure" className="flex-1">
					版ずれ
				</ToggleGroupItem>
			</ToggleGroup>
			<FieldDescription>{DESCRIPTIONS[state.titleDecoration]}</FieldDescription>
		</Field>
	);
}
