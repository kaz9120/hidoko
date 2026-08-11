import { cn } from "ui/lib/utils";

const OPTIONS: Array<{ value: boolean; label: string; aria: string }> = [
	{ value: false, label: "自動", aria: "自動" },
	{ value: true, label: "強制", aria: "強制" },
];

/**
 * スクリム（写真の上に重ねる暗幕）の 2 択。方向は組みが持っているので、
 * ユーザーが決めるのは「輝度から自動で判断させるか、常に敷くか」だけ。
 *
 * 副次 UI なので primary アクセント (ember) は使わず、bg-secondary
 * (= --bg-overlay) と border-strong のインセットリングで「沈み込み」を出して
 * 選択状態を表す。
 */
export function ScrimToggle({
	value,
	onChange,
}: {
	value: boolean;
	onChange: (next: boolean) => void;
}) {
	return (
		<div className="flex overflow-hidden rounded-md border border-border bg-input">
			{OPTIONS.map((option) => {
				const active = value === option.value;
				return (
					<button
						key={option.label}
						type="button"
						aria-label={`スクリム: ${option.aria}`}
						aria-pressed={active}
						onClick={() => onChange(option.value)}
						className={cn(
							"flex-1 cursor-pointer border-border border-l px-2 py-2 text-sm outline-none transition-colors first:border-l-0",
							"focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
							"active:bg-accent/60",
							active
								? "bg-secondary text-secondary-foreground shadow-[inset_0_0_0_1px_var(--border-strong)]"
								: "text-foreground hover:bg-accent/40",
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
