import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./sheet";

/**
 * 画面の端からスライドインするパネル。Radix Dialog をベースにした
 * 横出しの版。設定パネルやフィルタ条件のような、本編を残したまま
 * 補助情報を出したいときに使う。モバイル前提なら [Drawer](?path=/docs/shadcn-ui-drawer--docs) を選ぶ。
 *
 * @summary 横から出るパネル
 */
const meta = {
	title: "shadcn-ui/Sheet",
	component: Sheet,
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * デフォルトの右側から出るパネル。設定パネルやフィルタ条件のような、
 * 一時的に開いて主操作を残したい場面で使う。
 * @summary 右側からスライドインする基本形
 */
export const Default: Story = {
	render: () => (
		<div className="flex h-screen items-center justify-center">
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">設定を開く</Button>
				</SheetTrigger>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>表示設定</SheetTitle>
						<SheetDescription>
							火床の見え方を調整する。変更はすぐに反映される。
						</SheetDescription>
					</SheetHeader>
					<SheetFooter>
						<Button>保存</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	),
};

/**
 * `side="left"` で左側から出すパネル。ナビゲーション目的のメニューや、
 * 章立てのような階層構造を出すときに使うことが多い。
 * @summary 左側からスライドインする形
 */
export const FromLeft: Story = {
	render: () => (
		<div className="flex h-screen items-center justify-center">
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">メニューを開く</Button>
				</SheetTrigger>
				<SheetContent side="left">
					<SheetHeader>
						<SheetTitle>メニュー</SheetTitle>
						<SheetDescription>
							三軒茶屋の地図、夜の予定、火床のメモ。
						</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>
		</div>
	),
};
