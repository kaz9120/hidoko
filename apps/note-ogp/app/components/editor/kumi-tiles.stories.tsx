import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { KumiTiles, MilestoneTiles } from "./kumi-tiles";

/**
 * 組みセレクタのタイル。実写プレビューではなく矩形の抽象で、タイトルの居場所と
 * 号数の身振りの関係だけを示す。灰が文字の塊、ember が号数、淡い ember が
 * 面と大判。
 *
 * 通常号は 12 種、節目号は 3 変奏で、同じ場所・同じ作法（3 列グリッド・
 * 選択側に ember のボーダーとグロー）で選ぶ。幅は実際のパネル（440px から
 * 左右のパディングを引いた 392px）に合わせてある。
 *
 * @summary 組みセレクタのタイル
 */
const meta = {
	title: "note-ogp/Editor/KumiTiles",
	component: KumiTiles,
	parameters: { layout: "centered" },
	args: { value: "a1", onSelect: () => {} },
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="dark">
				<div className="w-[392px] bg-card p-4">
					<Story />
				</div>
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof KumiTiles>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の選択。A1 定番が ember のボーダーとグローで示される。
 * @summary A1 定番を選択
 */
export const Default: Story = {};

/**
 * 自動配置の H1 静けさを選んだ状態。選択の見え方が最後の行でも変わらないことを
 * 確認する。
 * @summary H1 静けさを選択
 */
export const QuietSelected: Story = {
	args: { value: "h1" },
};

/**
 * 節目号に切り替えた状態。同じ場所のタイルが 3 変奏に入れ替わる。
 * @summary 節目号 3 変奏
 */
export const Milestone: Story = {
	render: () => <MilestoneTiles value="watermark" onSelect={() => {}} />,
};
