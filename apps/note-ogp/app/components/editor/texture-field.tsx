import { ToggleGroup, ToggleGroupItem } from "ui";
import { Field, FieldDescription, FieldLabel } from "ui/components/field";
import type { Fields, PaperStrength, TextureId } from "~/lib/og-templates";

/**
 * 背景の質感の選択 UI。4 択 + 紙のときだけ強度（弱 / 中）を出す。
 * さじ加減は固定プリセットで、不透明度の自由調整は出さない。
 * 写真が主役のテンプレでは質感が写真の下に隠れるため、操作ごと無効化する。
 */
export function TextureField({
	state,
	update,
	unused,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	unused: boolean;
}) {
	return (
		<Field className="mb-3.5">
			<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
				背景の質感
			</FieldLabel>
			<ToggleGroup
				type="single"
				variant="outline"
				value={state.texture}
				disabled={unused}
				onValueChange={(v) => {
					if (v) update({ texture: v as TextureId });
				}}
				className="w-full"
			>
				<ToggleGroupItem value="none" className="flex-1">
					なし
				</ToggleGroupItem>
				<ToggleGroupItem value="paper" className="flex-1">
					紙
				</ToggleGroupItem>
				<ToggleGroupItem value="gradient" className="flex-1">
					グラデ
				</ToggleGroupItem>
				<ToggleGroupItem value="shape" className="flex-1">
					図形
				</ToggleGroupItem>
			</ToggleGroup>
			{!unused && state.texture === "paper" && (
				<ToggleGroup
					type="single"
					variant="outline"
					value={state.paperStrength}
					onValueChange={(v) => {
						if (v) update({ paperStrength: v as PaperStrength });
					}}
					className="w-full"
				>
					<ToggleGroupItem value="weak" className="flex-1">
						弱
					</ToggleGroupItem>
					<ToggleGroupItem value="medium" className="flex-1">
						中
					</ToggleGroupItem>
				</ToggleGroup>
			)}
			<FieldDescription>
				{unused
					? "写真が主役のテンプレでは使われない"
					: "ベタ塗りにひと匙の質感。さじ加減は固定"}
			</FieldDescription>
		</Field>
	);
}
