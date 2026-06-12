import { useId } from "react";
import { Button, ToggleGroup, ToggleGroupItem } from "ui";
import { Field, FieldDescription, FieldLabel } from "ui/components/field";
import { Input } from "ui/components/input";
import type { BadgeShape, BandPosition, Fields } from "~/lib/og-templates";
import { SectionTitle } from "./section-title";

// バッジの定型プリセット。クリックで文言を差し替える（自由入力でも上書き可）
const BADGE_PRESETS = ["NEW", "連載", "保存版", "第1回"] as const;

/**
 * あしらい部品（英字ウォーターマーク・リピート帯・バッジ）の操作 UI。
 * 各部品は on / off と最小限の文言入力のみ。不透明度・サイズ・配置は
 * 固定プリセットで、自由調整は出さない（盛りすぎを構造的に防ぐ）。
 */
export function AshiraiField({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	const watermarkId = useId();
	const bandId = useId();
	const badgeId = useId();

	return (
		<>
			<SectionTitle>あしらい</SectionTitle>

			<Field className="mb-3.5">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					英字ウォーターマーク
				</FieldLabel>
				<ToggleGroup
					type="single"
					variant="outline"
					value={state.watermark ? "on" : "off"}
					onValueChange={(v) => {
						if (v) update({ watermark: v === "on" });
					}}
					className="w-full"
				>
					<ToggleGroupItem value="off" className="flex-1">
						なし
					</ToggleGroupItem>
					<ToggleGroupItem value="on" className="flex-1">
						あり
					</ToggleGroupItem>
				</ToggleGroup>
				{state.watermark && (
					<Input
						id={watermarkId}
						value={state.watermarkText}
						onChange={(e) => update({ watermarkText: e.target.value })}
						placeholder={state.category || "ESSAY"}
						className="font-mono"
						aria-label="ウォーターマークの文言"
					/>
				)}
				<FieldDescription>
					背景に大きな英字をうっすら敷く。空欄ならカテゴリを使う
				</FieldDescription>
			</Field>

			<Field className="mb-3.5">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					リピートテキスト帯
				</FieldLabel>
				<ToggleGroup
					type="single"
					variant="outline"
					value={state.band}
					onValueChange={(v) => {
						if (v) update({ band: v as BandPosition });
					}}
					className="w-full"
				>
					<ToggleGroupItem value="none" className="flex-1">
						なし
					</ToggleGroupItem>
					<ToggleGroupItem value="top" className="flex-1">
						上端
					</ToggleGroupItem>
					<ToggleGroupItem value="bottom" className="flex-1">
						下端
					</ToggleGroupItem>
				</ToggleGroup>
				{state.band !== "none" && (
					<Input
						id={bandId}
						value={state.bandText}
						onChange={(e) => update({ bandText: e.target.value })}
						placeholder={state.category || "ESSAY"}
						className="font-mono"
						aria-label="帯に繰り返す単語"
					/>
				)}
				<FieldDescription>
					単語を繰り返した細い帯。空欄ならカテゴリを使う
				</FieldDescription>
			</Field>

			<Field className="mb-3.5">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					バッジ
				</FieldLabel>
				<ToggleGroup
					type="single"
					variant="outline"
					value={state.badge}
					onValueChange={(v) => {
						if (v) update({ badge: v as BadgeShape });
					}}
					className="w-full"
				>
					<ToggleGroupItem value="none" className="flex-1">
						なし
					</ToggleGroupItem>
					<ToggleGroupItem value="circle" className="flex-1">
						丸
					</ToggleGroupItem>
					<ToggleGroupItem value="stamp" className="flex-1">
						スタンプ
					</ToggleGroupItem>
				</ToggleGroup>
				{state.badge !== "none" && (
					<>
						<div className="flex flex-wrap gap-1.5">
							{BADGE_PRESETS.map((preset) => (
								<Button
									key={preset}
									type="button"
									variant={state.badgeText === preset ? "secondary" : "outline"}
									size="sm"
									className="h-7 px-2.5 text-xs"
									onClick={() => update({ badgeText: preset })}
								>
									{preset}
								</Button>
							))}
						</div>
						<Input
							id={badgeId}
							value={state.badgeText}
							onChange={(e) => update({ badgeText: e.target.value })}
							placeholder="NEW"
							aria-label="バッジの文言"
						/>
					</>
				)}
				<FieldDescription>右上に小さく 1 つだけ。文言は短く</FieldDescription>
			</Field>
		</>
	);
}
