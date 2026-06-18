import { cn } from "ui/lib/utils";
import type { StrengthScore } from "~/lib/strength";

interface PasswordStrengthProps {
	score: StrengthScore;
	className?: string;
}

// 4 セグメントの強度メーター。色は ember 系で 弱→強 を表す。
// score 0 のセグメントだけは、空欄/baseline 未達なので落ち着いた色に寄せる。
const SEGMENT_TONES = [
	"bg-[var(--ember-700)]",
	"bg-[var(--ember-600)]",
	"bg-[var(--accent-active)]",
	"bg-[var(--accent-hover)]",
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
							i < lit ? tone : "bg-[var(--border)]",
						)}
					/>
				))}
			</div>
			<span className="min-w-[2.5em] font-mono text-[11px] text-[var(--text-faint)] uppercase tracking-[0.12em]">
				{score.label}
			</span>
		</div>
	);
}
