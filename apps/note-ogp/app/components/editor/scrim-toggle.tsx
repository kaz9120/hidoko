import { cn } from "ui/lib/utils";
import type { Scrim } from "~/lib/og-templates";

const SCRIMS: Array<{ id: Scrim; label: string; aria: string }> = [
	{ id: "auto", label: "AUTO", aria: "自動" },
	{ id: "lb", label: "↙", aria: "左下" },
	{ id: "rb", label: "↘", aria: "右下" },
	{ id: "lt", label: "↖", aria: "左上" },
	{ id: "rt", label: "↗", aria: "右上" },
	{ id: "t", label: "↑", aria: "上" },
	{ id: "b", label: "↓", aria: "下" },
	{ id: "c", label: "◎", aria: "中央" },
];

export function ScrimToggle({
	value,
	onChange,
}: {
	value: Scrim;
	onChange: (next: Scrim) => void;
}) {
	return (
		<div className="flex overflow-hidden rounded-md border border-border bg-input">
			{SCRIMS.map((s) => {
				const active = value === s.id;
				return (
					<button
						key={s.id}
						type="button"
						aria-label={`スクリム: ${s.aria}`}
						aria-pressed={active}
						onClick={() => onChange(s.id)}
						className={cn(
							"flex-1 cursor-pointer border-border border-l px-2 py-2 text-sm transition-colors first:border-l-0",
							active
								? "bg-primary/15 text-primary"
								: "text-foreground hover:bg-accent/40",
						)}
					>
						{s.label}
					</button>
				);
			})}
		</div>
	);
}
