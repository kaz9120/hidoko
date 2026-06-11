import { NoteOgpEditor } from "~/components/editor/note-ogp-editor";

export function meta() {
	return [
		{ title: "note OGP — 火床" },
		{
			name: "description",
			content:
				"note のアイキャッチ画像（1280×670 PNG）を、3 つのテンプレートと書体・テーマの切替だけで素早く作るブラウザ完結のエディタ。",
		},
	];
}

export default function Home() {
	return <NoteOgpEditor />;
}
