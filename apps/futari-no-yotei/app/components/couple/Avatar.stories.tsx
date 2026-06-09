import type { Meta, StoryObj } from "@storybook/react-vite";

import type { User } from "~/lib/types";

import { Avatar } from "./Avatar";

/**
 * 夫婦のイニシャル 1 文字を丸チップで表示する小さな identity 表現。
 * `tone` で塗り分けるので、夫 (け) と妻 (は) が並んだ時に色だけで読み分けられる。
 *
 * 主に WhoseChip / 予定行 / 設定の編集 dialog などから呼ばれる。
 *
 * @summary 夫婦のイニシャルアバター
 */
const meta: Meta<typeof Avatar> = {
	title: "futari-no-yotei/Couple/Avatar",
	component: Avatar,
	parameters: {
		layout: "centered",
	},
};

export default meta;

type Story = StoryObj<typeof Avatar>;

const ME: User = {
	id: "u_me",
	name: "はる",
	initial: "は",
	tone: "var(--ember-400)",
};

const PARTNER: User = {
	id: "u_partner",
	name: "けい",
	initial: "け",
	tone: "var(--moon)",
};

/**
 * 自分 (はる) のアバター。ember 系の差し色で塗る。
 * @summary 自分のアバター
 */
export const Me: Story = {
	args: {
		user: ME,
	},
};

/**
 * 相手 (けい) のアバター。moon 系の差し色で、自分と並べたときに色だけで
 * 区別できる。
 * @summary 相手のアバター
 */
export const Partner: Story = {
	args: {
		user: PARTNER,
	},
};

/**
 * 大きいサイズ。設定画面のプロフィール行など、識別性をはっきり出したい
 * ところで使う。
 * @summary 大きめサイズ
 */
export const Large: Story = {
	args: {
		user: ME,
		size: 36,
	},
};

/**
 * 夫婦を並べて見せる比較用 story。色相とイニシャルで読み分けられているかを
 * 同じ目線で確認する。
 * @summary 夫婦を並べて比較
 */
export const Pair: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<Avatar user={ME} size={24} />
			<Avatar user={PARTNER} size={24} />
		</div>
	),
};
