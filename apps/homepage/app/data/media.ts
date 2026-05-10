/**
 * 「出ているもの」セクション。自分の作物ではないが、外で取り上げてもらった露出。
 * インタビュー / ポッドキャスト / YouTube などを想定。
 */
export type MediaType = "interview" | "podcast" | "youtube";

export type MediaItem = {
	id: string;
	type: MediaType;
	outlet: string;
	title: string;
	date: string;
	href: string;
	note: string;
};

export const MEDIA: MediaItem[] = [];
