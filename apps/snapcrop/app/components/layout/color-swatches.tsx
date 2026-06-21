import { PlusIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui";
import { PRESET_COLORS } from "~/lib/rect-engine";

/**
 * 注釈ツール共通のプリセット 6 色スウォッチ + カスタム色 (近日対応) ボタン。
 * rect-toolbar.tsx 内のものと同じ見た目で、矢印以降の注釈ツールバーが共用する。
 * セグメント類は ui の ToggleGroup で揃えるが、色だけは円形 + ブランドカラー
 * の都合で自前。`colors` で色配列を差し替えられる (マーカーの蛍光パレット等)。
 */
export function ColorSwatches({
	value,
	onChange,
	disabled = false,
	colors = PRESET_COLORS,
}: {
	value: string;
	onChange: (next: string) => void;
	disabled?: boolean;
	colors?: readonly string[];
}) {
	return (
		<div
			className="inline-flex items-center gap-1.5 px-1"
			style={{ opacity: disabled ? 0.35 : 1 }}
		>
			{colors.map((c) => {
				const active = value.toLowerCase() === c.toLowerCase();
				return (
					<button
						aria-pressed={active}
						aria-label={`色 ${c}`}
						className={`size-[18px] cursor-pointer rounded-full border-[1.5px] p-0 transition-transform not-disabled:hover:scale-110 disabled:cursor-not-allowed ${
							active
								? "border-text shadow-[0_0_0_1.5px_var(--bg)]"
								: "border-transparent"
						}`}
						disabled={disabled}
						key={c}
						onClick={() => onChange(c)}
						style={{ background: c }}
						type="button"
					/>
				);
			})}
			<Tooltip>
				<TooltipTrigger asChild>
					{/* aria-disabled で「無効だが Tooltip / focus は機能する」状態に。
					    native disabled だと pointer event を受けないので Tooltip が出ない。 */}
					<button
						aria-disabled="true"
						aria-label="カスタム色 (近日対応)"
						className="inline-flex size-[18px] cursor-not-allowed items-center justify-center rounded-full border-[1.5px] border-transparent p-0"
						onClick={(e) => e.preventDefault()}
						style={{
							background:
								"conic-gradient(from 0deg, #f44, #fa3, #fd0, #4d4, #4af, #94f, #f4a, #f44)",
						}}
						type="button"
					>
						<PlusIcon className="size-2.5 text-black/60" strokeWidth={2.5} />
					</button>
				</TooltipTrigger>
				<TooltipContent>近日対応</TooltipContent>
			</Tooltip>
		</div>
	);
}
