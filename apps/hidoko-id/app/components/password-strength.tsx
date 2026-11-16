import { cn } from "takibi-design-system";
import type { StrengthScore } from "~/lib/strength";

interface PasswordStrengthProps {
	score: StrengthScore;
	className?: string;
}

// 4 セグメントの強度メーター。暗い橙から明るい橙へ、弱→強 を表す。
// score 0 のセグメントだけは、空欄/baseline 未達なので落ち着いた色に寄せる。
const SEGMENT_TONES = [
	"bg-danger-solid",
	"bg-brand-active",
	"bg-brand",
	"bg-brand-hover",
] as const;

/**
 * パスワード強度メーター。`scorePassword` の結果をそのまま受ける。
 * 「弱い／並／熾火／強い」のテキストラベルと、4 セグメントのバーを並べる。
 */
export function PasswordStrength({ score, className }: PasswordStrengthProps) {
	const lit = score.score + 1;
	return (
		<div
			className={cn("flex items-center gap-3", className)}
			aria-live="polite"
		>
			<div
				className="flex flex-1 gap-1"
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={4}
				aria-valuenow={lit}
				aria-label="パスワード強度"
			>
				{SEGMENT_TONES.map((tone, i) => (
					<span
						key={tone}
						className={cn(
							"h-1.5 flex-1 rounded-full transition-colors",
							i < lit ? tone : "bg-line",
						)}
					/>
				))}
			</div>
			<span className="min-w-[2.5em] font-mono text-[11px] text-fg-subtle uppercase tracking-[0.12em]">
				{score.label}
			</span>
		</div>
	);
}
