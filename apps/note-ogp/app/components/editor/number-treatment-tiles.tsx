import { useRef } from "react";
import { cn } from "ui/lib/utils";
import { useFitScale } from "~/hooks/use-fit-scale";
import type { Fields, NumberTreatment } from "~/lib/og-templates";
import {
	Cover,
	FRAME_HEIGHT,
	FRAME_WIDTH,
	pickNumberCorner,
} from "~/lib/og-templates";

const TREATMENTS: Array<{ id: NumberTreatment; label: string; desc: string }> =
	[
		{ id: "corner", label: "N1", desc: "Corner" },
		{ id: "vertical", label: "N2", desc: "Vertical" },
		{ id: "written", label: "N3", desc: "Written" },
		{ id: "plate", label: "N4", desc: "Plate" },
		{ id: "watermark", label: "N5", desc: "Watermark" },
	];

export function NumberTreatmentTiles({
	state,
	onSelect,
}: {
	state: Fields;
	onSelect: (treatment: NumberTreatment) => void;
}) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{TREATMENTS.map((t) => {
				const corner = pickNumberCorner(state.titleSlot);
				// Watermark のときだけ、タイトル衝突を避けて S5 右コラムで比較する
				// (モック挙動: 各タイルは選択前の見え方を素直に出す)。
				const slot = t.id === "watermark" ? "rcol" : state.titleSlot;
				return (
					<Tile
						key={t.id}
						active={state.numberTreatment === t.id}
						label={`${t.label} ${t.desc}`}
						fields={{
							...state,
							titleSlot: slot,
							scrim: "auto",
							numberTreatment: t.id,
							numberOpts: {
								corner,
								side: "right",
								position: { left: 56, bottom: 92 },
							},
						}}
						onClick={() => onSelect(t.id)}
					/>
				);
			})}
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
				"relative aspect-[1280/670] cursor-pointer overflow-hidden rounded-md border bg-muted p-0 outline-none transition-colors",
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
				"active:translate-y-px",
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
