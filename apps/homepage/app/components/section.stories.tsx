import type { Meta, StoryObj } from "@storybook/react-vite";

import { Section } from "./section";

/**
 * トップページの各セクションを包む汎用 wrapper。`eyebrow`（小見出し）と
 * `title`、補助文の `lede`、本文 `children`、最後に右寄せの導線 `more`
 * を縦に並べる。`id` はアンカー遷移先に使う。
 *
 * @summary セクション見出し付きの wrapper
 */
const meta = {
	title: "homepage/Section",
	component: Section,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Section>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * eyebrow / title / lede / 本文を全部入れた標準形。
 * @summary 標準形
 */
export const Default: Story = {
	args: {
		id: "about",
		eyebrow: "About",
		title: "焚き火のそばで、火床をつくる",
		lede: "三軒茶屋でコードを書きながら、夜に焚き火に当たる時間を大切にしている。",
		children: (
			<p className="m-0 max-w-[60ch] text-[14.5px] leading-[1.8] text-muted-foreground">
				ここにセクションの本文が入る。Bio や Decks など、他のコンポーネントを
				そのまま children として渡す想定。
			</p>
		),
	},
};

/**
 * eyebrow と lede を省略した最小構成。タイトルと本文だけで成立させたいとき。
 * @summary タイトルと本文だけ
 */
export const TitleOnly: Story = {
	args: {
		id: "minimal",
		title: "見出しだけのセクション",
		children: (
			<p className="m-0 text-[14.5px] leading-[1.8] text-muted-foreground">
				補助テキストや eyebrow を入れずに、本文だけで進めるパターン。
			</p>
		),
	},
};

/**
 * 末尾に「もっと見る」相当の導線を置いたパターン。`more` は右寄せに揃う。
 * @summary 末尾に more 導線あり
 */
export const WithMore: Story = {
	args: {
		id: "decks",
		eyebrow: "Decks",
		title: "登壇資料",
		lede: "現場で話した内容を、その場の温度ごとここに置いている。",
		children: (
			<p className="m-0 text-[14.5px] leading-[1.8] text-muted-foreground">
				ここに資料カードが並ぶ想定。
			</p>
		),
		more: (
			<a
				href="https://speakerdeck.com/"
				target="_blank"
				rel="noreferrer"
				className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-primary"
			>
				Speaker Deck で全件を見る
			</a>
		),
	},
};
