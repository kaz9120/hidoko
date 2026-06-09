import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlameIcon, TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "./alert";

/**
 * 画面の上部や本文中に差し込む通知パネル。`AlertTitle` / `AlertDescription`
 * の 2 段で組む。アイコンを 1 つ前置すると、左に枠が用意されて自動で揃う。
 * 取り消し不可の確認には [AlertDialog](?path=/docs/shadcn-ui-alertdialog--docs)
 * を使う。
 *
 * @summary 画面内に置く通知パネル
 */
const meta = {
	title: "shadcn-ui/Alert",
	component: Alert,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定の variant。情報の補足や、軽い案内に使う。
 * @summary 標準の通知
 */
export const Default: Story = {
	render: () => (
		<Alert>
			<AlertTitle>夜の運用に切り替えました</AlertTitle>
			<AlertDescription>
				日没を過ぎたので、ダーク寄りのトークンが優先されます。
			</AlertDescription>
		</Alert>
	),
};

/**
 * 警告寄りの variant。失敗や、後戻りの効きにくい操作の前に出す。並べすぎると
 * 慣れて読み飛ばされるので、画面内に同時に出す数を抑える。
 * @summary 失敗・警告を示す
 */
export const Destructive: Story = {
	render: () => (
		<Alert variant="destructive">
			<AlertTitle>保存に失敗しました</AlertTitle>
			<AlertDescription>
				ネットワークを確認してから、もう一度お試しください。
			</AlertDescription>
		</Alert>
	),
};

/**
 * 先頭に Lucide icon を 1 つ前置した形。`Alert` は 2 列 grid なので、icon を
 * 直接子要素として入れると左の列に自動で寄せられる。
 * @summary アイコン付き
 */
export const WithIcon: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<Alert>
				<FlameIcon />
				<AlertTitle>焚き火モードに入りました</AlertTitle>
				<AlertDescription>
					通知を絞り込んで、考えごとに集中できる状態です。
				</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<TriangleAlertIcon />
				<AlertTitle>下書きが破棄されます</AlertTitle>
				<AlertDescription>
					編集中の内容は、保存しないままページを離れると失われます。
				</AlertDescription>
			</Alert>
		</div>
	),
};
