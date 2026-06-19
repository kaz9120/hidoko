import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlameIcon, MapPinIcon, NotebookPenIcon } from "lucide-react";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "./navigation-menu";

/**
 * 横並びの主導線。ヘッダーに置き、ホバーで子メニューを展開する。Radix の
 * NavigationMenu の wrapper で、`viewport` をオフにすればフラットなリンク帯としても使える。
 *
 * @summary ヘッダーの主導線メニュー
 */
const meta = {
	title: "shadcn-ui/NavigationMenu",
	component: NavigationMenu,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof NavigationMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * トリガをホバーすると子メニューが viewport に展開される。子は 2-3 項目の card 風に並べる。
 * @summary 子メニュー展開つき
 */
export const Default: Story = {
	render: () => (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>ふたりのよてい</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[280px] gap-1 p-2">
							<li>
								<NavigationMenuLink href="#">
									<div className="flex items-center gap-2 font-medium">
										<NotebookPenIcon /> 週ビュー
									</div>
									<p className="text-muted-foreground text-xs">
										今週のふたりの予定を行で見る
									</p>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink href="#">
									<div className="flex items-center gap-2 font-medium">
										<MapPinIcon /> 場所
									</div>
									<p className="text-muted-foreground text-xs">
										三軒茶屋 / 二子玉川 / 渋谷
									</p>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger>snapcrop</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[240px] gap-1 p-2">
							<li>
								<NavigationMenuLink href="#">
									<div className="flex items-center gap-2 font-medium">
										<FlameIcon /> 新規クロップ
									</div>
									<p className="text-muted-foreground text-xs">
										画像から領域を切り出す
									</p>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
						ドキュメント
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
};

/**
 * 子メニューを持たない、リンクだけのフラットな帯。Hidoko のサブナビなどに。
 * @summary フラットなリンク帯
 */
export const LinksOnly: Story = {
	render: () => (
		<NavigationMenu viewport={false}>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
						ホーム
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
						焚き火
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
						夜の散歩
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
						設定
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
};
