import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { EmojiPicker } from "./EmojiPicker";

/**
 * Slack のステータス入力欄を参考にした絵文字ピッカー。フル絵文字ピッカー
 * ではなく「家事 / 勤務 / 子育て / 予定 / ペット / 気持ち」のドメイン絵文字に
 * 絞っている。StatusItemDialog 内では Input の leading button として一体化
 * させて使うが、story では単体で挙動を確認する。
 *
 * @summary 家庭ドメインの絵文字ピッカー
 */
const meta: Meta<typeof EmojiPicker> = {
	title: "futari-no-yotei/Settings/EmojiPicker",
	component: EmojiPicker,
};

export default meta;

type Story = StoryObj<typeof EmojiPicker>;

/**
 * 何も選ばれていない初期状態。SmilePlus アイコンが leading に出る。
 * クリックで Popover が開き、カテゴリタブと 8 列の絵文字グリッドが並ぶ。
 * @summary 空の状態
 */
export const Empty: Story = {
	render: () => {
		const [value, setValue] = useState("");
		return (
			<div className="w-12 border border-border-subtle bg-bg-raised">
				<EmojiPicker
					value={value}
					onChange={setValue}
					contextLabel="新しい項目"
				/>
			</div>
		);
	},
};

/**
 * 既に絵文字が選ばれている状態。leading に選択中の絵文字が出る。クリック
 * で別の絵文字に変更できる。
 * @summary 選択済みの状態
 */
export const WithValue: Story = {
	render: () => {
		const [value, setValue] = useState("🍱");
		return (
			<div className="w-12 border border-border-subtle bg-bg-raised">
				<EmojiPicker value={value} onChange={setValue} contextLabel="弁当" />
			</div>
		);
	},
};

/**
 * 親 wrapper と並べた、StatusItemDialog 内での実装イメージ。leading button
 * と入力欄が border の中で 1 つのフィールドに見えること、focus が wrapper
 * 側に集約されることを確認する。
 * @summary 入力欄と一体化した使い方
 */
export const InFieldWrapper: Story = {
	render: () => {
		const [value, setValue] = useState("👔");
		return (
			<div className="flex h-10 w-[280px] items-stretch rounded-md border border-border bg-bg-raised">
				<EmojiPicker value={value} onChange={setValue} contextLabel="勤務" />
				<div
					aria-hidden
					className="my-1.5 w-px self-stretch bg-border-subtle"
				/>
				<input
					type="text"
					defaultValue="夫の勤務"
					className="flex-1 bg-transparent px-3 text-sm text-text-strong focus:outline-none"
				/>
			</div>
		);
	},
};
