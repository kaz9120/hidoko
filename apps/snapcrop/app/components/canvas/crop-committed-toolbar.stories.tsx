import type { Meta, StoryObj } from "@storybook/react-vite";

import { CropCommittedToolbar } from "./crop-committed-toolbar";

/**
 * クロップを確定したあとに出るバー。確定するとキャンバスが切り取り後に
 * 切り替わって枠が消えるので、このバーが「まだやり直せる」ことを伝える
 * 唯一の手掛かりになる。
 *
 * 元画像は捨てていないため、範囲を調整すれば枠を広げ直せる。全体に戻す操作も
 * 並べて、切り取りが行き止まりでないことを見えるようにしている。
 *
 * @summary クロップ確定後のバー
 */
const meta = {
	title: "snapcrop/Canvas/CropCommittedToolbar",
	component: CropCommittedToolbar,
	parameters: {
		layout: "padded",
	},
	render: (args) => (
		<div
			className="relative overflow-visible rounded-md border border-border bg-bg-base"
			style={{ width: 720, height: 240 }}
		>
			<div className="absolute inset-0 bg-gradient-to-br from-[var(--ember-700)] via-[var(--ember-500)] to-[var(--moon)] opacity-40" />
			<CropCommittedToolbar {...args} />
		</div>
	),
} satisfies Meta<typeof CropCommittedToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 一般的な確定後の状態。寸法は切り取り後のサイズで、そのまま書き出される値。
 * @summary 確定直後
 */
export const Default: Story = {
	args: {
		crop: { x: 120, y: 80, width: 640, height: 360 },
		onEdit: () => {},
		onReset: () => {},
	},
};

/**
 * 小さく切り取った状態。寸法表示が 3 桁未満でも並びが崩れないことを見る。
 * @summary 小さく切り取った場合
 */
export const SmallCrop: Story = {
	args: {
		crop: { x: 40, y: 40, width: 96, height: 72 },
		onEdit: () => {},
		onReset: () => {},
	},
};
