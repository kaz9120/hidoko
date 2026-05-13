import {
	ArrowUpRightIcon,
	type LucideIcon,
	MicIcon,
	NewspaperIcon,
	PlayIcon,
} from "lucide-react";

import { cn } from "ui";
import { EmptyState } from "~/components/empty-state";
import { MEDIA, type MediaItem, type MediaType } from "~/data/media";

const TYPE_META: Record<MediaType, { icon: LucideIcon; classes: string }> = {
	interview: {
		icon: NewspaperIcon,
		classes: "border-border-subtle bg-[var(--bg-sunken)] text-text-strong",
	},
	podcast: {
		icon: MicIcon,
		classes:
			"border-[color-mix(in_oklab,var(--ember-400)_30%,var(--border))] bg-[color-mix(in_oklab,var(--ember-400)_12%,var(--bg-sunken))] text-primary",
	},
	youtube: {
		icon: PlayIcon,
		classes:
			"border-[color-mix(in_oklab,#e94e3a_30%,var(--border))] bg-[color-mix(in_oklab,#e94e3a_12%,var(--bg-sunken))] text-[#e94e3a]",
	},
};

export function MediaList() {
	if (MEDIA.length === 0) return <EmptyState />;

	return (
		<div className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-[var(--shadow-card)]">
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
			className="grid grid-cols-[44px_1fr_auto] items-start gap-[14px] border-b border-border-subtle px-[18px] py-[18px] text-foreground transition-colors duration-200 last:border-b-0 hover:bg-secondary min-[880px]:grid-cols-[56px_1fr_auto] min-[880px]:gap-[18px] min-[880px]:px-6 min-[880px]:py-[22px]"
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
				<div className="flex items-baseline gap-3 text-[11.5px] text-text-faint">
					<span className="font-medium tracking-[0.02em] text-muted-foreground">
						{item.outlet}
					</span>
					<span className="font-mono text-[11px]">{item.date}</span>
				</div>
				<div className="text-[15.5px] font-medium leading-[1.45] tracking-[-0.005em] text-text-strong text-pretty">
					{item.title}
				</div>
				{item.note && (
					<p className="m-0 max-w-[64ch] text-[13px] leading-[1.6] text-muted-foreground">
						{item.note}
					</p>
				)}
			</div>
			<ArrowUpRightIcon
				className="mt-1 size-3.5 shrink-0 text-text-faint"
				aria-hidden="true"
			/>
		</a>
	);
}
