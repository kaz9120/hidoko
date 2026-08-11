import { NoteOgpEditor } from "~/components/editor/note-ogp-editor";

const SITE_TITLE = "note カバー画像";
const SITE_DESCRIPTION =
	"note のカバー画像（1280×670 PNG）を、写真とタイトルとレイアウトの 3 つだけで作るブラウザ完結のエディタ。";
const SITE_URL = "https://note-ogp.y-kaz.com/";
// このエディタ自身で書き出した静的画像
const OG_IMAGE_URL = `${SITE_URL}ogp.png`;

export function meta() {
	return [
		{ title: SITE_TITLE },
		{ name: "description", content: SITE_DESCRIPTION },
		{ property: "og:title", content: SITE_TITLE },
		{ property: "og:description", content: SITE_DESCRIPTION },
		{ property: "og:type", content: "website" },
		{ property: "og:url", content: SITE_URL },
		{ property: "og:image", content: OG_IMAGE_URL },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:site", content: "@kyamamoto9120" },
	];
}

export default function Home() {
	return <NoteOgpEditor />;
}
