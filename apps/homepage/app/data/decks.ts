/**
 * 「登壇資料」セクションのアイテム。Docswell / Speaker Deck を想定。
 *
 * - `event` はイベント名 (例: "EM Oasis Meetup #6")。本人記憶に依存するため明示で渡す
 * - `comment` は本人視点の一言。発表時の思いをひと言添える
 * - `platform` は URL のホスト名で判別すれば渡されなくても OK
 * - 1 件だけ `featured: true` にすると特集として OGP 大きめで表示される
 */
export type DeckPlatform = "Docswell" | "Speaker Deck";

export type Deck = {
	id: string;
	title: string;
	event: string;
	date: string;
	platform: DeckPlatform;
	comment: string;
	href: string;
	/** OGP サムネが取れたら public/ogp/<file> のパス。未取得は undefined */
	ogp?: string;
	featured?: boolean;
};

export const DECKS: Deck[] = [];

export const DECKS_INDEX_LINK = {
	label: "すべての登壇資料を見る",
	href: "https://www.docswell.com/user/kyamamoto9120",
} as const;
