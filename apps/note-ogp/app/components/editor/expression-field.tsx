import { ToggleGroup, ToggleGroupItem } from "ui";
import { Field, FieldDescription, FieldLabel } from "ui/components/field";
import type { Fields, JumpRate, Spacing } from "~/lib/og-templates";
import { JUMP_RATE_OPTIONS, SPACING_OPTIONS } from "~/lib/og-templates";

const SPACING_DESCRIPTIONS: Record<Spacing, string> = {
	tight: "余白を詰めて、勢いと密度を出す",
	normal: "現行どおりの余白",
	loose: "余白を広げて、上品に間を取る",
};

const JUMP_RATE_DESCRIPTIONS: Record<JumpRate, string> = {
	low: "タイトルを控えめに、しっとり見せる",
	normal: "現行どおりのサイズ比",
	high: "タイトルを立てて、インパクトを出す",
};

/**
 * 余白量とジャンプ率（タイトルとサブ要素のサイズ比）の選択 UI。
 * 印象を決める 2 大パラメータを 3 段階の固定プリセットだけで出し、
 * 連続スライダーは提供しない（さじ加減は段階で提供し、やりすぎを防ぐ）。
 */
export function ExpressionField({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	return (
		<>
			<Field className="mb-3.5">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					余白
				</FieldLabel>
				<ToggleGroup
					type="single"
					variant="outline"
					value={state.spacing}
					onValueChange={(v) => {
						if (v) update({ spacing: v as Spacing });
					}}
					className="w-full"
				>
					{SPACING_OPTIONS.map((o) => (
						<ToggleGroupItem key={o.id} value={o.id} className="flex-1">
							{o.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<FieldDescription>
					{SPACING_DESCRIPTIONS[state.spacing]}
				</FieldDescription>
			</Field>
			<Field className="mb-3.5">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					ジャンプ率
				</FieldLabel>
				<ToggleGroup
					type="single"
					variant="outline"
					value={state.jumpRate}
					onValueChange={(v) => {
						if (v) update({ jumpRate: v as JumpRate });
					}}
					className="w-full"
				>
					{JUMP_RATE_OPTIONS.map((o) => (
						<ToggleGroupItem key={o.id} value={o.id} className="flex-1">
							{o.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<FieldDescription>
					{JUMP_RATE_DESCRIPTIONS[state.jumpRate]}
				</FieldDescription>
			</Field>
		</>
	);
}
