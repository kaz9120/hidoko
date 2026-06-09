import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./card";

/**
 * 情報をひとかたまりにまとめる箱。Header / Content / Footer の 3 段で組み、
 * 必要なら CardAction で見出し右側にアクションを差し込む。リスト要素を
 * カード化したいときや、ダッシュボードのウィジェットの土台に使う。
 *
 * @summary 情報をまとめる枠
 */
const meta = {
	title: "shadcn-ui/Card",
	component: Card,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Header / Content / Footer の 3 段で組む基本形。
 * 焚き火の準備リストのような、小さな情報の塊を 1 枚で見せる。
 * @summary タイトルと本文とフッターの基本形
 */
export const Default: Story = {
	render: () => (
		<Card className="w-[360px]">
			<CardHeader>
				<CardTitle>三軒茶屋の夜</CardTitle>
				<CardDescription>
					火床のそばで読む 1 冊、淹れたての珈琲、薄手のブランケット。
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">
					道具は最小限。火を眺める時間を主役にする。
				</p>
			</CardContent>
			<CardFooter className="justify-end gap-2">
				<Button variant="ghost">あとで</Button>
				<Button>準備する</Button>
			</CardFooter>
		</Card>
	),
};

/**
 * `CardAction` でヘッダ右側にアクションを置く例。リスト 1 行分のカードで
 * 「開く」「メニュー」のような操作を出したいときに使う。
 * @summary ヘッダ右側にアクションを持つ形
 */
export const WithAction: Story = {
	render: () => (
		<Card className="w-[360px]">
			<CardHeader>
				<CardTitle>ふたりのよてい</CardTitle>
				<CardDescription>来週の土曜日、19 時から</CardDescription>
				<CardAction>
					<Button size="sm" variant="outline">
						詳細
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">
					夕飯はうちで。あとで一緒に火を見る。
				</p>
			</CardContent>
		</Card>
	),
};
