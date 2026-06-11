import { cn } from "ui/lib/utils";
import type { PaletteId, ThemeMode } from "~/lib/og-templates";
import { PALETTES } from "~/lib/og-templates";

/**
 * カラーパレットのスウォッチチップ。ベース / サブ / アクセントの 3 ロールを
 * 帯で見せる（アクセントは視認のため実比率 5% より太め）。自由なカラー
 * ピッカーは出さない — 色の盛りすぎを構造的に防ぐための名前付きプリセット制。
 */
export function PalettePicker({
	value,
	theme,
	onChange,
}: {
	value: PaletteId;
	theme: ThemeMode;
	onChange: (id: PaletteId) => void;
}) {
	return (
		<div className="grid grid-cols-4 gap-2">
			{PALETTES.map((p) => {
				const roles = p[theme];
				const active = p.id === value;
				return (
					<button
						key={p.id}
						type="button"
						aria-pressed={active}
						title={p.label}
						onClick={() => onChange(p.id)}
						className={cn(
							"flex cursor-pointer flex-col items-stretch gap-1 rounded-md border bg-muted/40 p-1.5 transition-colors",
							active
								? "border-primary shadow-[0_0_0_1px_var(--primary)]"
								: "border-border hover:border-muted-foreground/60",
						)}
					>
						<span
							aria-hidden
							className="flex h-5 w-full overflow-hidden rounded-[3px] border border-border/60"
						>
							<span className="flex-[70]" style={{ background: roles.base }} />
							<span className="flex-[25]" style={{ background: roles.sub }} />
							<span
								className="flex-[15]"
								style={{ background: roles.accent }}
							/>
						</span>
						<span
							className={cn(
								"text-center text-[10px] leading-tight tracking-[0.04em]",
								active ? "text-foreground" : "text-muted-foreground",
							)}
						>
							{p.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}
