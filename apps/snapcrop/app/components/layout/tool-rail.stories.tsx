import type { Meta, StoryObj } from "@storybook/react-vite";

import { SnapcropProvider } from "~/contexts/snapcrop-context";

import { ToolRail } from "./tool-rail";

/**
 * キャンバス左端に立つ縦長の編集ツール選択レール。クロップ / 矩形を
 * トグルで切り替える。実装は `image` が `null` のとき何も描画しないので、
 * Storybook 側で画像を差し込めない限り、empty 状態の story だけになる。
 *
 * 将来 arrow / text 等のツールを足すときは `TOOLS` を伸ばすだけ。
 *
 * @summary 編集ツールの選択レール
 */
const meta = {
	title: "snapcrop/Layout/ToolRail",
	component: ToolRail,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<SnapcropProvider>
				<div className="flex h-[400px] bg-[var(--ink-0)]">
					<Story />
					<div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
						キャンバス領域 (story では未描画)
					</div>
				</div>
			</SnapcropProvider>
		),
	],
} satisfies Meta<typeof ToolRail>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 画像未ロード時。実装上 `image` が `null` のときは何も描画しないので、
 * レール自体は表示されず、右側のプレースホルダだけが見える。実画面でレールが
 * 出るのは画像が入った後。
 * @summary 画像未ロード時 (非表示)
 */
export const Default: Story = {};
