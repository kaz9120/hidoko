import {
	ArrowUpRightIcon,
	type LucideIcon,
	MicIcon,
	NewspaperIcon,
	PlayIcon,
} from "lucide-react";

import { cn } from "takibi-design-system";
import { EmptyState } from "~/components/empty-state";
import { MEDIA, type MediaItem, type MediaType } from "~/data/media";

const TYPE_META: Record<MediaType, { icon: LucideIcon; classes: string }> = {
	interview: {
		icon: NewspaperIcon,
		classes: "border-line-subtle bg-surface-sunken text-fg-strong",
	},
	podcast: {
		icon: MicIcon,
		classes:
			"border-[color-mix(in_oklab,var(--color-brand)_30%,var(--color-line))] bg-[color-mix(in_oklab,var(--color-brand)_12%,var(--color-surface-sunken))] text-brand",
	},
	youtube: {
		icon: PlayIcon,
		classes: "border-danger/30 bg-danger-soft text-danger",
	},
};

export function MediaList() {
	if (MEDIA.length === 0) return <EmptyState />;

	return (
		<div className="flex flex-col overflow-hidden rounded-lg border bg-surface-raised shadow-card">
			{MEDIA.map((m) => (
				<MediaRow key={m.id} item={m} />
			))}
		</div>
	);
}

function MediaRow({ item }: { item: MediaItem }) {
	const meta = TYPE_META[item.type];
	const Icon = meta.icon;
	return (
		<a
			href={item.href}
			target="_blank"
			rel="noreferrer"
			className="grid grid-cols-[44px_1fr_auto] items-start gap-[14px] border-b border-line-subtle px-[18px] py-[18px] text-fg transition-colors duration-200 last:border-b-0 hover:bg-surface-overlay min-[880px]:grid-cols-[56px_1fr_auto] min-[880px]:gap-[18px] min-[880px]:px-6 min-[880px]:py-[22px]"
		>
			<div
				className={cn(
					"flex size-11 items-center justify-center rounded-md border",
					meta.classes,
				)}
			>
				<Icon className="size-[18px]" aria-hidden="true" />
			</div>
			<div className="flex min-w-0 flex-col gap-1.5">
				<div className="flex items-baseline gap-3 text-[11.5px] text-fg-subtle">
					<span className="font-medium tracking-[0.02em] text-fg-muted">
						{item.outlet}
					</span>
					<span className="font-mono text-[11px]">{item.date}</span>
				</div>
				<div className="text-[15.5px] font-medium leading-[1.45] tracking-[-0.005em] text-fg-strong text-pretty">
					{item.title}
				</div>
				{item.note && (
					<p className="m-0 max-w-[64ch] text-[13px] leading-[1.6] text-fg-muted">
						{item.note}
					</p>
				)}
			</div>
			<ArrowUpRightIcon
				className="mt-1 size-3.5 shrink-0 text-fg-subtle"
				aria-hidden="true"
			/>
		</a>
	);
}
