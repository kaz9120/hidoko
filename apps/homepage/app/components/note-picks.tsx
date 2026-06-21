import { ArrowUpRightIcon } from "lucide-react";

import { EmptyState } from "~/components/empty-state";
import { NOTE_PICKS, type NotePick } from "~/data/notes";

export function NotePicks() {
	if (NOTE_PICKS.length === 0) return <EmptyState />;

	const featured = NOTE_PICKS.find((n) => n.featured) ?? NOTE_PICKS[0];
	const rest = NOTE_PICKS.filter((n) => n.id !== featured.id);

	return (
		<div className="flex flex-col gap-[22px]">
			<FeaturedNote note={featured} />
			{rest.length > 0 && (
				<div className="grid grid-cols-1 gap-4 min-[880px]:grid-cols-2">
					{rest.map((n) => (
						<NoteCard key={n.id} note={n} />
					))}
				</div>
			)}
		</div>
	);
}

function FeaturedNote({ note }: { note: NotePick }) {
	return (
		<a
			href={note.href}
			target="_blank"
			rel="noreferrer"
			className="block rounded-lg border border-[color-mix(in_oklab,var(--ember-400)_22%,var(--border))] bg-bg-raised px-9 py-8 text-text shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--ember-400)_40%,var(--border))]"
		>
			<span className="font-mono text-xs text-text-faint">{note.date}</span>
			<h3 className="mt-3.5 mb-3 text-[clamp(22px,2.4vw,28px)] font-semibold leading-[1.35] tracking-[-0.018em] text-text-strong">
				{note.title}
			</h3>
			<p className="mb-[18px] max-w-[64ch] text-[14.5px] leading-[1.8] text-text-muted">
				{note.excerpt}
			</p>
			<div className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent">
				note で読む
				<ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
			</div>
		</a>
	);
}

function NoteCard({ note }: { note: NotePick }) {
	return (
		<a
			href={note.href}
			target="_blank"
			rel="noreferrer"
			className="flex flex-col gap-2.5 rounded-lg border bg-bg-raised p-[22px] text-text shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-px hover:border-border-strong"
		>
			<span className="font-mono text-[11px] text-text-faint">{note.date}</span>
			<h4 className="m-0 text-[16.5px] font-medium leading-[1.45] tracking-[-0.01em] text-text-strong">
				{note.title}
			</h4>
			<p className="m-0 text-[13px] leading-[1.65] text-text-muted">
				{note.excerpt}
			</p>
			<div className="mt-auto flex items-center border-t border-border-subtle pt-3 text-text-faint">
				<ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
			</div>
		</a>
	);
}
