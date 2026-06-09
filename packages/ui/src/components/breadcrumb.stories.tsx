import type { Meta, StoryObj } from "@storybook/react-vite";
import { SlashIcon } from "lucide-react";

import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "./breadcrumb";

/**
 * 階層をたどるためのナビゲーション。Hidoko ではページ上部の左寄せに置き、
 * 自分が今どこにいて、どこから来たかを 1 行で示す。
 * 末端の現在地は `BreadcrumbPage`、それ以外は `BreadcrumbLink` でリンクにする。
 *
 * @summary 階層ナビゲーション
 */
const meta = {
	title: "shadcn-ui/Breadcrumb",
	component: Breadcrumb,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Breadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * よくある 3 階層。ホームから現在地まで `>` で区切る。
 * @summary 標準の 3 階層
 */
export const Default: Story = {
	render: () => (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">ホーム</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href="#">ふたりのよてい</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>設定</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	),
};

/**
 * 階層が深いときの省略表示。途中を `BreadcrumbEllipsis` で畳んで、両端だけ見せる。
 * @summary 中間を畳んだ省略形
 */
export const WithEllipsis: Story = {
	render: () => (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">ホーム</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbEllipsis />
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href="#">三軒茶屋</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>火床の夜</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	),
};

/**
 * 区切り文字をカスタムする例。`BreadcrumbSeparator` の children を差し替えると
 * 任意の icon に置き換えられる。
 * @summary カスタム区切り
 */
export const CustomSeparator: Story = {
	render: () => (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">ホーム</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator>
					<SlashIcon />
				</BreadcrumbSeparator>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">snapcrop</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator>
					<SlashIcon />
				</BreadcrumbSeparator>
				<BreadcrumbItem>
					<BreadcrumbPage>新規作成</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	),
};
