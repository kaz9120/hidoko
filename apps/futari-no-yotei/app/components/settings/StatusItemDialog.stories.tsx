import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "ui/components/button";

import { StatusItemDialog } from "./StatusItemDialog";

/**
 * ステータス項目の追加 / 編集 dialog。`mode="create"` のときは空フォーム、
 * `mode="edit"` のときは `initial` を初期値として埋め、削除ボタン (AlertDialog
 * 経由) も出す。
 *
 * 守りの UX:
 *   - 外タップ / ESC は preventDefault で抑止する
 *   - dirty なまま閉じようとしたら「変更を破棄しますか?」を確認する
 *
 * story 側は `useState` で open を制御し、ボタンクリックで起動する形にする。
 *
 * @summary 項目の追加 / 編集 dialog
 */
const meta: Meta<typeof StatusItemDialog> = {
	title: "futari-no-yotei/Settings/StatusItemDialog",
	component: StatusItemDialog,
	parameters: {
		layout: "centered",
	},
};

export default meta;

type Story = StoryObj<typeof StatusItemDialog>;

/**
 * 新規追加モード。空フォームから項目名・絵文字・「誰が決める」を入力する。
 * トリガから開く形で story 化し、外タップ抑止や dirty 破棄確認の挙動も
 * Storybook 上で触って確認できる。
 * @summary 新規追加モード
 */
export const Create: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button variant="outline" onClick={() => setOpen(true)}>
					項目を追加
				</Button>
				<StatusItemDialog
					mode="create"
					open={open}
					onOpenChange={setOpen}
					onSubmit={() => setOpen(false)}
				/>
			</>
		);
	},
};

/**
 * 編集モード。既存の項目「弁当」を編集する初期状態。削除ボタンが左下に出る。
 * @summary 編集モード
 */
export const Edit: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button variant="outline" onClick={() => setOpen(true)}>
					項目を編集
				</Button>
				<StatusItemDialog
					mode="edit"
					initial={{
						id: "bento",
						name: "弁当",
						emoji: "🍱",
						assignee: "me",
					}}
					open={open}
					onOpenChange={setOpen}
					onSubmit={() => setOpen(false)}
					onDelete={() => setOpen(false)}
				/>
			</>
		);
	},
};

/**
 * 送信中の状態。保存ボタンが「保存中…」表示で disabled になり、連打で重複
 * 作成されないことを示す。
 * @summary 保存送信中
 */
export const Submitting: Story = {
	render: () => {
		const [open, setOpen] = useState(true);
		return (
			<>
				<Button variant="outline" onClick={() => setOpen(true)}>
					項目を編集
				</Button>
				<StatusItemDialog
					mode="edit"
					initial={{
						id: "dinner",
						name: "晩御飯",
						emoji: "🍚",
						assignee: "both",
					}}
					open={open}
					onOpenChange={setOpen}
					onSubmit={() => undefined}
					onDelete={() => undefined}
					submitting
				/>
			</>
		);
	},
};

/**
 * 削除中の状態。削除ボタンが「削除中…」になり、保存 / キャンセル含めて
 * 全部弾くことで DELETE の二重発行を防ぐ。
 * @summary 削除送信中
 */
export const Deleting: Story = {
	render: () => {
		const [open, setOpen] = useState(true);
		return (
			<>
				<Button variant="outline" onClick={() => setOpen(true)}>
					項目を編集
				</Button>
				<StatusItemDialog
					mode="edit"
					initial={{
						id: "bento",
						name: "弁当",
						emoji: "🍱",
						assignee: "me",
					}}
					open={open}
					onOpenChange={setOpen}
					onSubmit={() => undefined}
					onDelete={() => undefined}
					deleting
				/>
			</>
		);
	},
};
