import { cn } from "ui/lib/utils";
import type {
	OgRoles,
	PaletteSelection,
	PhotoPalette,
	ThemeMode,
} from "~/lib/og-templates";
import { PALETTES } from "~/lib/og-templates";

/**
 * カラーパレットのスウォッチチップ。ベース / サブ / アクセントの 3 ロールを
 * 帯で見せる（アクセントは視認のため実比率 5% より太め）。自由なカラー
 * ピッカーは出さない — 色の盛りすぎを構造的に防ぐための名前付きプリセット制。
 * 写真がある場合は、抽出した配色候補（馴染ませ / 引き立て）を上段に出す。
 */
export function PalettePicker({
	value,
	theme,
	photoPalettes,
	onChange,
}: {
	value: PaletteSelection;
	theme: ThemeMode;
	photoPalettes?: PhotoPalette[] | null;
	onChange: (id: PaletteSelection) => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			{photoPalettes && photoPalettes.length > 0 && (
				<div>
					<p className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
						写真から
					</p>
					<div className="grid grid-cols-2 gap-2">
						{photoPalettes.map((p) => (
							<PaletteChip
								key={p.id}
								label={p.label}
								title={`写真から抽出: ${p.label}`}
								roles={p[theme]}
								active={p.id === value}
								onClick={() => onChange(p.id)}
							/>
						))}
					</div>
				</div>
			)}
			<div className="grid grid-cols-4 gap-2">
				{PALETTES.map((p) => (
					<PaletteChip
						key={p.id}
						label={p.label}
						title={p.label}
						roles={p[theme]}
						active={p.id === value}
						onClick={() => onChange(p.id)}
					/>
				))}
			</div>
		</div>
	);
}

function PaletteChip({
	label,
	title,
	roles,
	active,
	onClick,
}: {
	label: string;
	title: string;
	roles: OgRoles;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={active}
			title={title}
			onClick={onClick}
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
				<span className="flex-[15]" style={{ background: roles.accent }} />
			</span>
			<span
				className={cn(
					"text-center text-[10px] leading-tight tracking-[0.04em]",
					active ? "text-foreground" : "text-muted-foreground",
				)}
			>
				{label}
			</span>
		</button>
	);
}
