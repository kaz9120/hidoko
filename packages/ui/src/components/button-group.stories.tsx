import type { Meta, StoryObj } from "@storybook/react-vite";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

import { Button } from "./button";
import {
	ButtonGroup,
	ButtonGroupSeparator,
	ButtonGroupText,
} from "./button-group";

/**
 * 複数の Button を 1 本に連結する。隣り合う角を削ぎ、ボーダーを共有して
 * 「ひとかたまり」に見せる。`orientation` で縦横を切り替えられる。
 * 排他選択 (segmented) として使うときは aria-pressed を併用する。
 *
 * @summary 連結したボタン群
 */
const meta = {
	title: "shadcn-ui/ButtonGroup",
	component: ButtonGroup,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 3 つの操作を 1 本に連結する標準形。各ボタンの責務は別だが、関連の強さを連結で示す。
 * @summary 並列アクションの連結
 */
export const Default: Story = {
	render: () => (
		<ButtonGroup>
			<Button variant="outline">前へ</Button>
			<Button variant="outline">今日</Button>
			<Button variant="outline">次へ</Button>
		</ButtonGroup>
	),
};

/**
 * 排他選択 (segmented) として使う例。アクティブを `default` 変種、非アクティブを
 * `outline` 変種で塗り分け、ツールバー風のトグルにする。
 * @summary セグメント切り替え
 */
export const Segmented: Story = {
	render: () => (
		<ButtonGroup>
			<Button variant="default" aria-pressed>
				<BoldIcon />
			</Button>
			<Button variant="outline">
				<ItalicIcon />
			</Button>
			<Button variant="outline">
				<UnderlineIcon />
			</Button>
		</ButtonGroup>
	),
};

/**
 * 縦に連結したい場合の例。Sidebar の細い列などで使う。
 * @summary 縦方向の連結
 */
export const Vertical: Story = {
	render: () => (
		<ButtonGroup orientation="vertical">
			<Button variant="outline">上</Button>
			<Button variant="outline">中</Button>
			<Button variant="outline">下</Button>
		</ButtonGroup>
	),
};

/**
 * テキストラベルや separator と組み合わせて、入力アフィックスのように使う例。
 * 単位や接頭辞を見せたいフォームに向く。
 * @summary テキスト + Separator つき
 */
export const WithTextAndSeparator: Story = {
	render: () => (
		<ButtonGroup>
			<ButtonGroupText>三軒茶屋</ButtonGroupText>
			<ButtonGroupSeparator />
			<Button variant="outline">変更</Button>
		</ButtonGroup>
	),
};
