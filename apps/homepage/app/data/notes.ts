/**
 * 「書いたもの」セクションに載せる記事。note / Zenn を想定。
 * 1 件だけ `featured: true` にすると、その 1 件が特集カードとして大きく表示される。
 */
export type NotePick = {
	id: string;
	title: string;
	excerpt: string;
	date: string;
	href: string;
	featured?: boolean;
};

export const NOTE_PICKS: NotePick[] = [];

export const NOTE_INDEX_LINKS = [
	{ label: "note の記事一覧", href: "https://note.com/kyamamoto9120" },
	{ label: "Zenn の記事一覧", href: "https://zenn.dev/kyamamoto9120" },
] as const;
