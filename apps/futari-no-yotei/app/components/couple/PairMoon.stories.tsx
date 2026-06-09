import type { Meta, StoryObj } from "@storybook/react-vite";

import { PairMoon } from "./PairMoon";

/**
 * 「ふたりのよてい」のブランドマーク。2 つの三日月が重なって 1 つの月の輪郭を
 * つくる。色はデフォルトで accent (はる) と moon (けい) のミックスで、設定や
 * トップヘッダーの装飾として置く。
 *
 * @summary ふたりのよていのブランドマーク
 */
const meta = {
	title: "futari-no-yotei/Couple/PairMoon",
	component: PairMoon,
} satisfies Meta<typeof PairMoon>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の見た目。size=36、color は accent と moon のグラデ。
 * @summary 既定のマーク
 */
export const Default: Story = {};

/**
 * 大きく表示。スプラッシュ / オンボーディング画面などのキービジュアル用途。
 * @summary 大きめサイズ
 */
export const Large: Story = {
	args: {
		size: 96,
	},
};

/**
 * 単色寄りにした variant。chip 内部に小さく置くなど、装飾性を抑えたい時の
 * 落とし方を確認する。
 * @summary 単色寄り
 */
export const SingleTone: Story = {
	args: {
		size: 48,
		color: "var(--accent)",
		color2: "var(--accent)",
	},
};

/**
 * 並べたときに id が衝突せず複数表示できることの確認。useId による gradient
 * id の一意化が効いていれば、左右どちらも輝度を保ったまま描画される。
 * @summary 複数並べた時
 */
export const SideBySide: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<PairMoon size={36} />
			<PairMoon size={36} />
			<PairMoon size={36} />
		</div>
	),
};
