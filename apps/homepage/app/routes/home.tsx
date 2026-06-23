import { ArrowUpRightIcon } from "lucide-react";

import { Bio } from "~/components/bio";
import { Decks } from "~/components/decks";
import { Footer } from "~/components/footer";
import { Hero } from "~/components/hero";
import { MediaList } from "~/components/media-list";
import { NotePicks } from "~/components/note-picks";
import { Section } from "~/components/section";
import { Tools } from "~/components/tools";
import { TopNav } from "~/components/top-nav";
import { DECKS_INDEX_LINK } from "~/data/decks";
import { NOTE_INDEX_LINKS } from "~/data/notes";

const SITE_TITLE = "y-kaz.com — 山本 一将";
const SITE_DESCRIPTION =
	"焚き火を愛するエンジニア / Yamamoto Kazumasa の個人サイト。";
const SITE_URL = "https://y-kaz.com/";

export function meta() {
	return [
		{ title: SITE_TITLE },
		{ name: "description", content: SITE_DESCRIPTION },
		{ property: "og:title", content: SITE_TITLE },
		{ property: "og:description", content: SITE_DESCRIPTION },
		{ property: "og:type", content: "website" },
		{ property: "og:url", content: SITE_URL },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:site", content: "@kyamamoto9120" },
	];
}

export default function Home() {
	return (
		<div id="top">
			<TopNav />
			<Hero />

			<Section id="about" eyebrow="About" title="自己紹介">
				<Bio />
			</Section>

			<Section
				id="picks"
				eyebrow="Notes"
				title="書いたもの"
				lede="特に読んでほしいものを置いています。"
				more={NOTE_INDEX_LINKS.map((link) => (
					<MoreLink key={link.href} href={link.href} label={link.label} />
				))}
			>
				<NotePicks />
			</Section>

			<Section
				id="decks"
				eyebrow="Decks"
				title="登壇資料"
				lede="どんな思いで話したかも、一言ずつ添えています。"
				more={
					<MoreLink
						href={DECKS_INDEX_LINK.href}
						label={DECKS_INDEX_LINK.label}
					/>
				}
			>
				<Decks />
			</Section>

			<Section
				id="media"
				eyebrow="Media"
				title="出ているもの"
				lede="インタビューや Podcast・YouTube で、取り上げてもらったもの。"
			>
				<MediaList />
			</Section>

			<Section id="tools" eyebrow="Tools" title="作ったもの">
				<Tools />
			</Section>

			<Footer />
		</div>
	);
}

function MoreLink({ href, label }: { href: string; label: string }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="inline-flex items-center gap-1 border-b border-transparent pb-px font-medium text-primary transition-all duration-200 hover:border-brand-hover hover:text-brand-hover"
		>
			{label}
			<ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
		</a>
	);
}
