import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./table";

/**
 * 表組み。`TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell`
 * を組み合わせて使う。横幅が足りないときは外側のラッパが横スクロールする。
 *
 * @summary 行と列で並べる表組み
 */
const meta = {
	title: "shadcn-ui/Table",
	component: Table,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 「ふたりのよてい」のステータス項目一覧を模した最小サンプル。状態列には
 * Badge を入れて、表内での variant の見え方も確認する。
 * @summary 基本の 1 表
 */
export const Default: Story = {
	render: () => (
		<Table>
			<TableCaption>ふたりのよてい / ステータス項目</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>項目</TableHead>
					<TableHead>担当</TableHead>
					<TableHead>状態</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>夕食の買い出し</TableCell>
					<TableCell>kyamamoto</TableCell>
					<TableCell>
						<Badge>進行中</Badge>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>三軒茶屋で焚き火</TableCell>
					<TableCell>kyamamoto</TableCell>
					<TableCell>
						<Badge variant="secondary">下書き</Badge>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>note 公開</TableCell>
					<TableCell>kyamamoto</TableCell>
					<TableCell>
						<Badge variant="outline">アーカイブ</Badge>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	),
};
