import { type RefObject, useRef } from "react";
import { useFitScale } from "~/hooks/use-fit-scale";
import type { Fields, TemplateDef } from "~/lib/og-templates";

/**
 * 1280×670 のテンプレを縮小プレビューする中央ペイン。
 * `frameRef` を親に返し、PNG 書き出し時の対象 DOM とする。
 */
export function Stage({
	tpl,
	fields,
	frameRef,
}: {
	tpl: TemplateDef;
	fields: Fields;
	frameRef: RefObject<HTMLDivElement | null>;
}) {
	const wrapRef = useRef<HTMLDivElement | null>(null);
	const scale = useFitScale(wrapRef, 1280, 670, "contain");
	const Comp = tpl.Comp;

	return (
		<section className="note-ogp-stage-bg flex h-full flex-col border-r border-border">
			<div className="flex flex-shrink-0 items-center justify-between border-b border-border px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground">
				<span className="flex items-center gap-2">
					<span className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_12px_color-mix(in_oklab,var(--ember-400)_50%,transparent)]" />
					note OGP　1280 × 670
				</span>
				<strong className="font-medium text-foreground">
					{tpl.label}　·　{tpl.note}
				</strong>
			</div>
			<div className="flex flex-1 items-center justify-center overflow-auto p-8">
				<div
					ref={wrapRef}
					className="flex h-full w-full items-center justify-center"
				>
					<div style={{ width: 1280 * scale, height: 670 * scale }}>
						<div
							ref={frameRef}
							className="origin-top-left overflow-hidden rounded-[4px]"
							style={{
								width: 1280,
								height: 670,
								transform: `scale(${scale})`,
								boxShadow:
									"0 24px 80px color-mix(in oklab, var(--ink-0) 60%, transparent), 0 2px 0 color-mix(in oklab, var(--ink-0) 40%, transparent), 0 0 0 1px var(--border)",
							}}
						>
							<Comp f={fields} />
						</div>
						<div className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
							<b className="font-medium text-foreground/70">
								{Math.round(scale * 100)}%
							</b>
							　·　書き出しは1280×670 PNG
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
