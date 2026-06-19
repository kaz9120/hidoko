import type { Meta, StoryObj } from "@storybook/react-vite";

import { DirectionProvider } from "./direction";

/**
 * Radix の `DirectionProvider` の薄ラップ。配下の Radix コンポーネントに
 * 文字方向 (`ltr` / `rtl`) を伝える。アプリの言語設定が RTL になったときに
 * Menu・Popover などの開く向きが反転する。
 *
 * @summary 文字方向の Provider
 */
const meta: Meta<typeof DirectionProvider> = {
	title: "shadcn-ui/Direction",
	component: DirectionProvider,
	parameters: {
		layout: "centered",
	},
};

export default meta;

type Story = StoryObj<typeof DirectionProvider>;

/**
 * 既定の `ltr` で配下を包む例。日本語・英語のアプリはこの設定で動かす。
 * @summary 左から右
 */
export const LeftToRight: Story = {
	render: () => (
		<DirectionProvider dir="ltr">
			<div className="rounded-md border px-4 py-3 text-sm">
				焚き火を囲む夜は、三軒茶屋の路地裏が一番落ち着く。
			</div>
		</DirectionProvider>
	),
};

/**
 * `rtl` を渡すと、配下の Radix コンポーネントが右からの動線で開くようになる。
 * 文字自体の向きは CSS が決めるので、ここでは方向が切り替わったことだけ伝える。
 * @summary 右から左
 */
export const RightToLeft: Story = {
	render: () => (
		<DirectionProvider dir="rtl">
			<div dir="rtl" className="rounded-md border px-4 py-3 text-sm">
				مرحباً — RTL の文脈で配下の Radix が右側起点で開く。
			</div>
		</DirectionProvider>
	),
};
