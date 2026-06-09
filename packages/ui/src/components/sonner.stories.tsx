import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";

import { Button } from "./button";
import { Toaster } from "./sonner";

/**
 * sonner ベースのトースト UI。`Toaster` をアプリのルート（または story
 * の `render`）に 1 つ置き、任意の場所から `toast()` を呼んで通知を出す。
 * 操作の結果を画面遷移なしで返す軽い feedback 用途に向く。永続的に残したい
 * 情報は [Alert](?path=/docs/shadcn-ui-alert--docs) を使う。
 *
 * @summary 非同期通知のトースト
 */
const meta = {
	title: "shadcn-ui/Sonner",
	component: Toaster,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 成功通知の基本形。ボタンを押すと右下から `toast.success()` が立ち上がる。
 * @summary success トースト
 */
export const Default: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Button
				onClick={() => toast.success("焚き火の記録を保存しました")}
			>
				保存
			</Button>
			<Toaster />
		</div>
	),
};

/**
 * エラー通知。失敗の事実と、その原因を 1 行で添える。
 * @summary error トースト
 */
export const Error: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				onClick={() =>
					toast.error("保存に失敗しました", {
						description: "ネットワークが切れている可能性があります",
					})
				}
			>
				保存（失敗）
			</Button>
			<Toaster />
		</div>
	),
};

/**
 * 進行中の非同期処理を `toast.promise()` で待つ用例。loading → success
 * / error に自動で遷移する。
 * @summary promise を待つトースト
 */
export const Promise: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				onClick={() => {
					const task = new globalThis.Promise<string>((resolve) => {
						setTimeout(() => resolve("三軒茶屋"), 1500);
					});
					toast.promise(task, {
						loading: "薪をくべている…",
						success: (place) => `${place} の焚き火が燃え上がった`,
						error: "火が点かなかった",
					});
				}}
			>
				火をつける
			</Button>
			<Toaster />
		</div>
	),
};

/**
 * action ボタン入りの通知。「元に戻す」のような取消アクションを通知の中に
 * 持たせる用例。
 * @summary action 付きトースト
 */
export const WithAction: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				onClick={() =>
					toast("記録をアーカイブしました", {
						action: {
							label: "元に戻す",
							onClick: () => toast.success("戻しました"),
						},
					})
				}
			>
				アーカイブ
			</Button>
			<Toaster />
		</div>
	),
};
