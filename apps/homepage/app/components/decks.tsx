import { ArrowUpRightIcon } from "lucide-react";

import { cn } from "ui";
import { EmptyState } from "~/components/empty-state";
import { DECKS, type Deck } from "~/data/decks";

export function Decks() {
	if (DECKS.length === 0) return <EmptyState />;

	const featured = DECKS.find((d) => d.featured) ?? DECKS[0];
	const rest = DECKS.filter((d) => d.id !== featured.id);

	return (
		<div className="flex flex-col gap-[22px]">
			<FeaturedDeck deck={featured} />
			{rest.length > 0 && (
				<div className="grid grid-cols-1 gap-[18px] min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
					{rest.map((d) => (
						<DeckCard key={d.id} deck={d} />
					))}
				</div>
			)}
		</div>
	);
}

function DeckThumb({ deck, className }: { deck: Deck; className?: string }) {
	const accent = deck.featured;
	return (
		<div
			className={cn(
				"relative aspect-video overflow-hidden bg-gradient-to-br from-[var(--ink-200)] to-[var(--ink-100)]",
				accent &&
					"bg-[radial-gradient(ellipse_at_30%_70%,color-mix(in_oklab,var(--ember-400)_20%,transparent)_0%,transparent_60%),linear-gradient(135deg,var(--ink-200)_0%,var(--ink-100)_100%)]",
				className,
			)}
			style={
				deck.ogp
					? {
							backgroundImage: `url(${deck.ogp})`,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}
					: undefined
			}
			aria-hidden="true"
		/>
	);
}

function FeaturedDeck({ deck }: { deck: Deck }) {
	return (
		<a
			href={deck.href}
			target="_blank"
			rel="noreferrer"
			className="grid grid-cols-1 overflow-hidden rounded-xl border bg-card text-foreground shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--ember-400)_40%,var(--border))] min-[880px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
		>
			<DeckThumb deck={deck} className="min-h-[200px] min-[880px]:h-full" />
			<div className="flex flex-col gap-3.5 px-[34px] py-[30px]">
				<div className="flex flex-wrap items-center gap-2.5 font-mono text-[11.5px] text-text-faint">
					<span>{deck.date}</span>
					<span className="opacity-50">·</span>
					<span className="text-muted-foreground">{deck.event}</span>
				</div>
				<h3 className="m-0 text-[clamp(20px,2.2vw,26px)] font-semibold leading-[1.35] tracking-[-0.01em] text-text-strong text-balance">
					{deck.title}
				</h3>
				<p className="m-0 max-w-[50ch] text-[14.5px] leading-[1.7] text-muted-foreground">
					{deck.comment}
				</p>
				<div className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-medium text-primary">
					資料を見る
					<ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
				</div>
			</div>
		</a>
	);
}

function DeckCard({ deck }: { deck: Deck }) {
	return (
		<a
			href={deck.href}
			target="_blank"
			rel="noreferrer"
			className="flex flex-col overflow-hidden rounded-lg border bg-card text-foreground shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong"
		>
			<DeckThumb deck={deck} />
			<div className="flex flex-1 flex-col gap-2 px-5 py-[18px]">
				<div className="flex items-center gap-1.5 font-mono text-[11px] text-text-faint">
					<span>{deck.date}</span>
					<span className="opacity-50">·</span>
					<span className="min-w-0 truncate text-muted-foreground">
						{deck.event}
					</span>
				</div>
				<h3 className="m-0 text-[15.5px] font-medium leading-[1.45] tracking-[-0.01em] text-text-strong text-balance">
					{deck.title}
				</h3>
				<p className="m-0 line-clamp-2 text-[13px] leading-[1.6] text-muted-foreground">
					{deck.comment}
				</p>
			</div>
		</a>
	);
}
