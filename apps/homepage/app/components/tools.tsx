import { ArrowUpRightIcon } from "lucide-react";

import { cn } from "ui";
import { TOOLS } from "~/data/tools";

export function Tools() {
	return (
		<div className="grid max-w-[720px] grid-cols-1 gap-4">
			{TOOLS.map((tool) => (
				<a
					key={tool.id}
					href={tool.href}
					target="_blank"
					rel="noreferrer"
					className={cn(
						"flex flex-col gap-3 rounded-lg border bg-bg-raised px-7 py-[26px] text-text shadow-[var(--shadow-card)] transition-all duration-200",
						"hover:-translate-y-0.5 hover:border-border-strong",
						tool.accent &&
							"border-[color-mix(in_oklab,var(--ember-400)_22%,var(--border))]",
					)}
				>
					<div className="flex items-baseline justify-between gap-3.5">
						<h3 className="m-0 text-[22px] font-semibold tracking-[-0.018em] text-text-strong">
							{tool.name}
						</h3>
						<span className="inline-flex items-center gap-1 font-mono text-[12.5px] text-accent">
							{tool.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
							<ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
						</span>
					</div>
					<p className="m-0 text-sm leading-[1.75] text-text-muted">
						{tool.desc}
					</p>
					<div className="flex flex-wrap gap-1.5">
						{tool.tags.map((tag) => (
							<span
								key={tag}
								className="inline-flex rounded-sm border border-border-subtle bg-[var(--bg-sunken)] px-2.5 py-1 font-mono text-xs text-text-muted"
							>
								{tag}
							</span>
						))}
					</div>
				</a>
			))}
		</div>
	);
}
