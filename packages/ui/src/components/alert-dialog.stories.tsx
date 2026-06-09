import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";

/**
 * 不可逆な操作の最終確認に使うモーダル。Radix の `AlertDialog` を Hidoko の
 * トークン上に載せた wrapper。通常の [Dialog](?path=/docs/shadcn-ui-dialog--docs)
 * と違い、外タップ・ESC で閉じないので、誤操作で取り返しがつかない場面に向く。
 *
 * @summary 不可逆操作の確認モーダル
 */
const meta = {
	title: "shadcn-ui/AlertDialog",
	component: AlertDialog,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof AlertDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 削除確認の基本形。Action 側を `destructive` variant にして、押した瞬間に
 * 失うものを明示する。
 * @summary 削除確認の基本形
 */
export const Default: Story = {
	render: () => (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="outline">焚き火の記録を削除</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>この焚き火の記録を削除しますか</AlertDialogTitle>
					<AlertDialogDescription>
						記録に紐づく写真とメモも一緒に消えます。元に戻せません。
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>やめる</AlertDialogCancel>
					<AlertDialogAction variant="destructive">削除する</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
};

/**
 * `size="sm"` の縦並び 2 ボタン。モバイルで横幅が取れない場面や、選択肢が
 * 2 つしかないシンプルな確認向き。
 * @summary 小さいサイズの確認
 */
export const Small: Story = {
	render: () => (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="outline">ログアウト</Button>
			</AlertDialogTrigger>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>ログアウトしますか</AlertDialogTitle>
					<AlertDialogDescription>
						再ログインには三軒茶屋の合言葉が要ります。
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>やめる</AlertDialogCancel>
					<AlertDialogAction>続ける</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
};

/**
 * 親が open / onOpenChange を持つ controlled な形。確認の結果を別の state
 * に反映したい、もしくは複数のトリガから同じ確認を出したいときに使う。
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
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>controlled な確認</AlertDialogTitle>
							<AlertDialogDescription>
								親側で開閉を握っているので、ボタン以外の経路からも開ける。
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>やめる</AlertDialogCancel>
							<AlertDialogAction onClick={() => setOpen(false)}>
								続ける
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		);
	},
};
