import { Bio } from "~/components/bio";
import { Footer } from "~/components/footer";
import { Hero } from "~/components/hero";
import { Section } from "~/components/section";
import { Tools } from "~/components/tools";
import { TopNav } from "~/components/top-nav";

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
		<div id="top" className="ykz-app">
			<TopNav />
			<Hero />

			<Section id="about" eyebrow="About" title="自己紹介">
				<Bio />
			</Section>

			<Section id="tools" eyebrow="Tools" title="作ったもの">
				<Tools />
			</Section>

			<Footer />
		</div>
	);
}
