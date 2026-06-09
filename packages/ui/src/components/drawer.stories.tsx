import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "./drawer";

/**
 * 下から引き出すパネル。`vaul` を Hidoko のトークン上に載せた wrapper。
 * モバイルでの操作シートや、本編の上に補助情報を重ねたい場面で使う。
 * デスクトップで横から出したいなら [Sheet](?path=/docs/shadcn-ui-sheet--docs) を選ぶ。
 *
 * @summary 下から引き出すパネル
 */
const meta = {
	title: "shadcn-ui/Drawer",
	component: Drawer,
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 下から引き出す基本形。タイトル・本文・フッターの 3 段で組む。
 * ハンドル相当のつまみが上端に出る。
 * @summary 下から出る基本形
 */
export const Default: Story = {
	render: () => (
		<div className="flex h-screen items-center justify-center">
			<Drawer>
				<DrawerTrigger asChild>
					<Button variant="outline">予定を確認する</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>ふたりのよてい</DrawerTitle>
						<DrawerDescription>
							土曜の夜、三軒茶屋の火床のそばで。
						</DrawerDescription>
					</DrawerHeader>
					<DrawerFooter>
						<Button>承諾する</Button>
						<DrawerClose asChild>
							<Button variant="ghost">あとにする</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</div>
	),
};
