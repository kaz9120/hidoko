import { useRef } from "react";
import { cn } from "ui/lib/utils";
import { useFitScale } from "~/hooks/use-fit-scale";
import type { Fields, TemplateDef } from "~/lib/og-templates";

export function TemplateThumb({
	tpl,
	fields,
	active,
	onClick,
}: {
	tpl: TemplateDef;
	fields: Fields;
	active: boolean;
	onClick: () => void;
}) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const scale = useFitScale(ref, 1280, 670, "width");
	const Comp = tpl.Comp;

	return (
		<button
			ref={ref}
			type="button"
			onClick={onClick}
			title={tpl.note}
			className={cn(
				"relative aspect-[1280/670] cursor-pointer overflow-hidden rounded-md border bg-muted p-0 transition-colors",
				active
					? "border-primary shadow-[0_0_0_1px_var(--primary),0_4px_16px_rgba(244,125,58,0.15)]"
					: "border-border hover:border-muted-foreground/60",
			)}
		>
			<div
				className="pointer-events-none absolute inset-0 origin-top-left"
				style={{ width: 1280, height: 670, transform: `scale(${scale})` }}
			>
				<Comp f={fields} />
			</div>
			<span className="pointer-events-none absolute bottom-1 left-1.5 rounded-[2px] bg-background/70 px-1 py-px font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
				{tpl.label}
			</span>
		</button>
	);
}
