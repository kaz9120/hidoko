import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlameIcon, MailIcon, SearchIcon } from "lucide-react";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
} from "./input-group";

/**
 * Input / Textarea の左右、もしくは上下に icon やボタン、テキスト addon を
 * 足す合成コンポーネント。検索バー、単位付き数値入力、ドメイン suffix 付き
 * 入力など、「入力の文脈」を addon で表現したいときに使う。
 *
 * @summary 入力に addon を足す合成
 */
const meta = {
	title: "shadcn-ui/InputGroup",
	component: InputGroup,
} satisfies Meta<typeof InputGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 入力欄だけの最小構成。Input を直接置くのと見た目は近いが、addon を
 * 後から足せる素地として使う。
 * @summary 入力単体
 */
export const Default: Story = {
	render: () => (
		<div className="w-64">
			<InputGroup>
				<InputGroupInput placeholder="例: 三軒茶屋" />
			</InputGroup>
		</div>
	),
};

/**
 * 左に検索アイコンを置いた検索バー。`align="inline-start"` で左端 addon。
 * @summary 検索バー（左 icon）
 */
export const WithLeadingIcon: Story = {
	render: () => (
		<div className="w-72">
			<InputGroup>
				<InputGroupAddon align="inline-start">
					<SearchIcon />
				</InputGroupAddon>
				<InputGroupInput placeholder="焚き火スポットを探す" />
			</InputGroup>
		</div>
	),
};

/**
 * 右にテキスト addon を置いた単位入力（mm 等）。`align="inline-end"` で
 * 右端 addon。
 * @summary 単位付き入力
 */
export const WithTrailingUnit: Story = {
	render: () => (
		<div className="w-56">
			<InputGroup>
				<InputGroupInput type="number" defaultValue={30} />
				<InputGroupAddon align="inline-end">
					<InputGroupText>mm</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</div>
	),
};

/**
 * 右に送信ボタンを置く例。ニュースレター購読フォームのような UI で使う。
 * @summary 右にボタン
 */
export const WithTrailingButton: Story = {
	render: () => (
		<div className="w-80">
			<InputGroup>
				<InputGroupAddon align="inline-start">
					<MailIcon />
				</InputGroupAddon>
				<InputGroupInput type="email" placeholder="name@example.com" />
				<InputGroupAddon align="inline-end">
					<InputGroupButton size="sm" variant="default">
						送る
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
		</div>
	),
};

/**
 * `InputGroupTextarea` を使った長文入力。`align="block-start"` で上端に
 * ラベル / icon を、`align="block-end"` で下端にツールバーを置ける。
 * @summary 上下 addon 付き textarea
 */
export const BlockAlignedTextarea: Story = {
	render: () => (
		<div className="w-96">
			<InputGroup>
				<InputGroupAddon align="block-start">
					<FlameIcon />
					<InputGroupText>今夜のメモ</InputGroupText>
				</InputGroupAddon>
				<InputGroupTextarea
					placeholder="火床の前で気付いたことを書く"
					rows={3}
				/>
			</InputGroup>
		</div>
	),
};
