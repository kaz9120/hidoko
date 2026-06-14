import { useRef } from "react";
import { cn } from "ui/lib/utils";
import { useFitScale } from "~/hooks/use-fit-scale";
import type { Fields, TitleSlot } from "~/lib/og-templates";
import { Cover, FRAME_HEIGHT, FRAME_WIDTH } from "~/lib/og-templates";

const SLOTS: Array<{ id: TitleSlot; label: string; desc: string }> = [
	{ id: "bl", label: "S1", desc: "左下" },
	{ id: "br", label: "S2", desc: "右下" },
	{ id: "tl", label: "S3", desc: "左上" },
	{ id: "center", label: "S4", desc: "中央" },
	{ id: "rcol", label: "S5", desc: "右コラム" },
	{ id: "topwide", label: "S6", desc: "横長" },
];

export function TitleSlotTiles({
	state,
	onSelect,
}: {
	state: Fields;
	onSelect: (slot: TitleSlot) => void;
}) {
	// タイル間の比較を素直にするため、号数の身振りは N1 Corner で固定する。
	const base: Fields = {
		...state,
		numberTreatment: "corner",
		numberOpts: { corner: "tr" },
	};
	return (
		<div className="grid grid-cols-3 gap-2">
			{SLOTS.map((s) => (
				<Tile
					key={s.id}
					active={state.titleSlot === s.id}
					label={`${s.label} ${s.desc}`}
					fields={{ ...base, titleSlot: s.id, scrim: "auto" }}
					onClick={() => onSelect(s.id)}
				/>
			))}
		</div>
	);
}

function Tile({
	active,
	label,
	fields,
	onClick,
}: {
	active: boolean;
	label: string;
	fields: Fields;
	onClick: () => void;
}) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const scale = useFitScale(ref, FRAME_WIDTH, FRAME_HEIGHT, "width");
	return (
		<button
			ref={ref}
			type="button"
			onClick={onClick}
			className={cn(
				"relative aspect-[1280/670] cursor-pointer overflow-hidden rounded-md border bg-muted p-0 transition-colors",
				active
					? "border-primary shadow-[var(--glow-ember)]"
					: "border-border hover:border-muted-foreground/60",
			)}
			aria-pressed={active}
		>
			<div
				className="pointer-events-none absolute inset-0 origin-top-left"
				style={{
					width: FRAME_WIDTH,
					height: FRAME_HEIGHT,
					transform: `scale(${scale})`,
				}}
			>
				<Cover f={fields} />
			</div>
			<span
				className={cn(
					"pointer-events-none absolute top-1 left-1 rounded-[2px] bg-background/70 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.18em]",
					active ? "text-primary" : "text-foreground",
				)}
			>
				{label}
			</span>
		</button>
	);
}
