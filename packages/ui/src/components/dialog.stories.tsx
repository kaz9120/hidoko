import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "./button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";

/**
 * モーダルダイアログ。Radix の `Dialog` を Hidoko のトークン上に載せた wrapper。
 * 不可逆操作の確認は [AlertDialog](?path=/docs/shadcn-ui-alertdialog--docs) を、
 * 画面横から出すパネルは [Sheet](?path=/docs/shadcn-ui-sheet--docs) を使う。
 *
 * 「外タップで閉じる」「ESC で閉じる」を抑制したい dirty フォーム系の用例は、
 * `onPointerDownOutside={(e) => e.preventDefault()}` を `DialogContent` に
 * 渡して中断する。
 *
 * @summary モーダルダイアログ
 */
const meta = {
	title: "shadcn-ui/Dialog",
	component: Dialog,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Trigger 起動の基本形。タイトル・本文・フッターの 3 段で組む。
 * @summary トリガから開く基本形
 */
export const Default: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">開く</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ダイアログのタイトル</DialogTitle>
					<DialogDescription>
						補助テキスト。何のためのダイアログかを 1 文で。
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="ghost">キャンセル</Button>
					<Button>続ける</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

/**
 * 入力欄を中に持つフォーム用ダイアログ。Label + Input の組を `Field` 等で
 * グルーピングし、フッターで保存 / キャンセル を出す。
 * @summary フォーム入りダイアログ
 */
export const WithForm: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button>プロフィールを編集</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[420px]">
				<DialogHeader>
					<DialogTitle>プロフィール</DialogTitle>
					<DialogDescription>
						表示名は他のメンバーから見えます。
					</DialogDescription>
				</DialogHeader>
				<form className="flex flex-col gap-3">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="name">表示名</Label>
						<Input id="name" defaultValue="kyamamoto" />
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="bio">自己紹介</Label>
						<Input id="bio" placeholder="焚き火を愛するエンジニア" />
					</div>
				</form>
				<DialogFooter>
					<Button variant="ghost">キャンセル</Button>
					<Button>保存</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

/**
 * 外部 state で controlled にする例。複数のトリガから同じダイアログを開きたい
 * とき、または親が「閉じてよいか」を判断する dirty フォーム系で使う。
 * @summary controlled な open 制御
 */
export const Controlled: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<div className="flex items-center gap-2">
				<Button variant="outline" onClick={() => setOpen(true)}>
					外から開く
				</Button>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>controlled な dialog</DialogTitle>
							<DialogDescription>
								open / onOpenChange を親が持つことで、閉じる経路を制御できる。
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button onClick={() => setOpen(false)}>閉じる</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	},
};
