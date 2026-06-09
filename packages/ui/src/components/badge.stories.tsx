import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlameIcon } from "lucide-react";

import { Badge } from "./badge";

/**
 * ラベルや状態を 1 単語で示す小さなチップ。リストの行末や見出しの脇に
 * 1 つだけ添えるのが基本。複数並ぶ場面では分類軸を 1 本に絞る。
 *
 * @summary ラベル / 状態を示すチップ
 */
const meta = {
	title: "shadcn-ui/Badge",
	component: Badge,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の塗りつぶし。`primary` 色で目立たせる、もっとも頻度の高い使い方。
 * @summary 既定の塗りつぶし
 */
export const Default: Story = {
	args: {
		children: "進行中",
	},
};

/**
 * 主張を抑えたサブ色。primary を別の場所で使っているときの 2 番手として。
 * @summary 控えめなサブ色
 */
export const Secondary: Story = {
	args: {
		variant: "secondary",
		children: "下書き",
	},
};

/**
 * 注意喚起や失敗状態。並べすぎると刺激が強くなるので 1 画面 1 つを目安に。
 * @summary 警告・失敗を示す
 */
export const Destructive: Story = {
	args: {
		variant: "destructive",
		children: "失敗",
	},
};

/**
 * 枠線のみ。背景が濃い面の上や、他の塗りつぶし bagde と並ぶときに馴染ませる。
 * @summary 枠線のみ
 */
export const Outline: Story = {
	args: {
		variant: "outline",
		children: "アーカイブ",
	},
};

/**
 * 先頭に Lucide icon を入れた構成。アイコンは `size-3` に自動で寄せられる。
 * @summary アイコン付き
 */
export const WithIcon: Story = {
	render: () => (
		<Badge>
			<FlameIcon />
			焚き火モード
		</Badge>
	),
};
