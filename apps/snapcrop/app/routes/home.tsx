import { EditorCanvas } from "~/components/layout/editor-canvas";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { StatusBar } from "~/components/layout/status-bar";
import { SnapcropProvider } from "~/contexts/snapcrop-context";

const APP_URL = "https://snapcrop.y-kaz.com/";
const OG_IMAGE_URL = "https://snapcrop.y-kaz.com/og-image.svg";
const DESCRIPTION =
	"画面キャプチャから画像の切り抜きまで、ブラウザひとつで完結する画像エディタ";

export function meta() {
	return [
		{ title: "snapcrop" },
		{ name: "description", content: DESCRIPTION },
		{ property: "og:title", content: "snapcrop" },
		{ property: "og:description", content: DESCRIPTION },
		{ property: "og:url", content: APP_URL },
		{ property: "og:type", content: "website" },
		{ property: "og:site_name", content: "snapcrop" },
		{ property: "og:image", content: OG_IMAGE_URL },
		{ property: "og:image:width", content: "1200" },
		{ property: "og:image:height", content: "630" },
		{
			property: "og:image:alt",
			content: "snapcrop — 撮ってすぐ、書き込んで、共有まで",
		},
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:site", content: "@kyamamoto9120" },
		{ name: "twitter:creator", content: "@kyamamoto9120" },
	];
}

export default function Home() {
	return (
		<SnapcropProvider>
			<div className="flex h-screen flex-col">
				<SiteHeader />
				<EditorCanvas />
				<StatusBar />
				<SiteFooter />
			</div>
		</SnapcropProvider>
	);
}
