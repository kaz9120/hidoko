import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlameIcon, InfoIcon } from "lucide-react";

import { Button } from "./button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./tooltip";

/**
 * トリガに hover/focus すると出る短い注釈。Radix の `Tooltip` を Hidoko の
 * トークン上に載せた wrapper。アイコンだけのボタンの説明、短いキーボード
 * ショートカットの提示、項目の補助テキストに向く。長文や入力欄を持つ
 * 用途は [Popover](?path=/docs/shadcn-ui-popover--docs) を使う。
 *
 * `TooltipProvider` をルートに置く必要があるので、各 story で wrap する。
 *
 * @summary 短い注釈のオーバーレイ
 */
const meta = {
	title: "shadcn-ui/Tooltip",
	component: Tooltip,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * アイコンボタンの説明としての基本形。文字情報を持たないボタンに、視覚障害
 * 補助も兼ねて意味を添える。
 * @summary アイコンボタンの説明
 */
export const Default: Story = {
	render: () => (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline" size="icon">
						<FlameIcon />
					</Button>
				</TooltipTrigger>
				<TooltipContent>焚き火を起こす</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	),
};

/**
 * `side` で出る方向を指定できる。狭い枠の中、もしくは画面端のトリガで
 * 表示方向を寄せたいときに使う。
 * @summary 4 方向の配置
 */
export const Sides: Story = {
	parameters: {
		layout: "padded",
	},
	render: () => (
		<TooltipProvider>
			<div className="grid grid-cols-2 gap-12 p-12">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">top</Button>
					</TooltipTrigger>
					<TooltipContent side="top">上に出る</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">right</Button>
					</TooltipTrigger>
					<TooltipContent side="right">右に出る</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">bottom</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">下に出る</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">left</Button>
					</TooltipTrigger>
					<TooltipContent side="left">左に出る</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	),
};

/**
 * テキストの中に紛れさせた情報アイコン。`InfoIcon` の隣に hover で説明
 * を見せる、設定項目の補助テキスト風の用例。
 * @summary テキスト隣の情報アイコン
 */
export const InfoIconHint: Story = {
	render: () => (
		<TooltipProvider>
			<div className="flex items-center gap-1.5 text-sm">
				<span>火床の温度</span>
				<Tooltip>
					<TooltipTrigger asChild>
						<button type="button" className="inline-flex text-text-muted">
							<InfoIcon className="size-3.5" />
						</button>
					</TooltipTrigger>
					<TooltipContent>赤外線センサで計った薪の表面温度</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	),
};
