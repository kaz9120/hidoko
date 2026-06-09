import type { Meta, StoryObj } from "@storybook/react-vite";
import { SettingsIcon } from "lucide-react";

import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "./popover";

/**
 * トリガに紐づいて出る軽量パネル。Radix の `Popover` を Hidoko のトークン
 * 上に載せた wrapper。設定パネル、補助情報、軽い編集フォーム等、モーダル
 * ほど主張したくない用途に向く。深い確認は
 * [Dialog](?path=/docs/shadcn-ui-dialog--docs) を使う。
 *
 * @summary トリガに紐づく軽量パネル
 */
const meta = {
	title: "shadcn-ui/Popover",
	component: Popover,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * タイトルと本文だけの基本形。トリガから少し離れた位置に出るので、トリガと
 * 内容のつながりが視覚的に追える。
 * @summary 説明テキスト入りの基本形
 */
export const Default: Story = {
	render: () => (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">焚き火について</Button>
			</PopoverTrigger>
			<PopoverContent>
				<PopoverHeader>
					<PopoverTitle>火床（Hidoko）</PopoverTitle>
					<PopoverDescription>
						個人開発を楽しむための基盤。三軒茶屋の夜から育っている。
					</PopoverDescription>
				</PopoverHeader>
			</PopoverContent>
		</Popover>
	),
};

/**
 * 軽い編集フォームを内包する用例。モーダルにするほどではないけれど、入力
 * 欄をいくつか並べて即時に編集したいときに使う。
 * @summary 入力フォーム入り
 */
export const WithForm: Story = {
	render: () => (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">
					<SettingsIcon />
					表示の設定
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="flex flex-col gap-3">
					<PopoverHeader>
						<PopoverTitle>表示の設定</PopoverTitle>
						<PopoverDescription>
							ホームに並べる項目の幅と高さ。
						</PopoverDescription>
					</PopoverHeader>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="width">幅</Label>
						<Input id="width" defaultValue="320px" />
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="height">高さ</Label>
						<Input id="height" defaultValue="120px" />
					</div>
				</div>
			</PopoverContent>
		</Popover>
	),
};

/**
 * `align` を切り替えると、トリガの左端 / 中央 / 右端に揃えて出る。トリガ
 * の位置と、画面の余白の都合で使い分ける。
 * @summary align を切り替えた配置
 */
export const Alignment: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" size="sm">
						start
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start">
					<PopoverDescription>左端そろえ</PopoverDescription>
				</PopoverContent>
			</Popover>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" size="sm">
						center
					</Button>
				</PopoverTrigger>
				<PopoverContent align="center">
					<PopoverDescription>中央そろえ</PopoverDescription>
				</PopoverContent>
			</Popover>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" size="sm">
						end
					</Button>
				</PopoverTrigger>
				<PopoverContent align="end">
					<PopoverDescription>右端そろえ</PopoverDescription>
				</PopoverContent>
			</Popover>
		</div>
	),
};
