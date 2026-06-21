import type { Meta, StoryObj } from "@storybook/react-vite";

import { TopNav } from "./top-nav";

/**
 * ページ最上部に固定表示されるナビゲーション。ロゴ + サイト名、セクション
 * アンカー（About / Notes / Decks / Media / Tools）、X DM 導線で構成する。
 * `window.scrollY > 24` で半透明 + 背景ぼかしに切り替える挙動を持つ。
 *
 * react-router の `Link` / `useNavigate` は使っておらず、すべて素の `<a>`
 * アンカーで動くため、MemoryRouter での wrap は不要。
 *
 * @summary 固定表示のトップナビ
 */
const meta = {
	title: "homepage/TopNav",
	component: TopNav,
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof TopNav>;

export default meta;

type Story = StoryObj<typeof meta>;

// 文言の重複が将来発生しても安定 key になるよう、id を別フィールドで持つ。
const DUMMY_PARAGRAPHS = [
	{
		id: "p1",
		text: "火床 (Hidoko) は、焚き火の中心にある熾火が静かに燃え続ける場所。",
	},
	{
		id: "p2",
		text: "派手な炎ではなく、長く・深く・静かに熱を保ち続けるもの。",
	},
	{
		id: "p3",
		text: "UI もそうあってほしい。装飾を引き算で整えると、必要な熱だけが残る。",
	},
	{
		id: "p4",
		text: "ダークモードを基調に、夜の落ち着きと焚き火の暖かさを共存させる。",
	},
	{
		id: "p5",
		text: "上端のナビは、半透明と少しのぼかしで「奥にいる」と感じさせたい。",
	},
	{ id: "p6", text: "スクロールするほどに、ナビの存在感が後ろに沈み込む。" },
	{
		id: "p7",
		text: "でも完全には消えない。必要なときに視線をあげれば、そこにある。",
	},
	{
		id: "p8",
		text: "三軒茶屋の路地裏のような、静かに開いている扉のような距離感。",
	},
	{
		id: "p9",
		text: "純黒も純白も使わない。少し黄味を帯びた夜と、暖かいクリーム。",
	},
	{
		id: "p10",
		text: "primary のオレンジは指紋。リンクとフォーカスにだけ留めて、節度を保つ。",
	},
	{
		id: "p11",
		text: "焚き火のように、近づきすぎず、離れすぎず、長く灯る道具を作る。",
	},
	{
		id: "p12",
		text: "スクロールを止めると、ナビの背景がじわっと密度を上げる。それで十分。",
	},
];

/**
 * 既定の表示。ページ上端に固定された状態を見る。Storybook のキャンバスでは
 * スクロールが発生しないため、スクロール後の半透明背景は別 story で確認する。
 * @summary 既定の表示
 */
export const Default: Story = {};

/**
 * スクロール後の見え方を、十分な縦コンテンツを並べて再現する例。実際に
 * キャンバスをスクロールすると、24px 超過で背景が半透明 + ぼかしに切り替わる。
 * @summary スクロール後の半透明状態
 */
export const Scrolled: Story = {
	render: () => (
		<div>
			<TopNav />
			<div className="px-[var(--ykz-pad)] pt-[160px] pb-[200px]">
				<div className="mx-auto flex max-w-[1080px] flex-col gap-6 text-text-muted">
					{DUMMY_PARAGRAPHS.map((para) => (
						<p key={para.id} className="m-0 text-[14.5px] leading-[1.85]">
							{para.text}
						</p>
					))}
				</div>
			</div>
		</div>
	),
};
