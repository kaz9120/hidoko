import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./resizable";

/**
 * 横並びまたは縦並びのペインを、境界をドラッグしてリサイズできる
 * グループ。`react-resizable-panels` を Hidoko のトークン上に
 * 載せた wrapper。エディタとプレビュー、サイドナビと本編、といった
 * 2 ペイン構成で使う。
 *
 * @summary ドラッグでリサイズできるペイン
 */
const meta: Meta<typeof ResizablePanelGroup> = {
	title: "shadcn-ui/Resizable",
	component: ResizablePanelGroup,
	parameters: {
		layout: "padded",
	},
};

export default meta;

type Story = StoryObj<typeof ResizablePanelGroup>;

/**
 * 水平方向に並んだ 2 ペイン。境界の handle にグリップを出し、
 * ドラッグの余地があることを伝える。
 * @summary 横並び 2 ペインの基本形
 */
export const Default: Story = {
	render: () => (
		<ResizablePanelGroup
			orientation="horizontal"
			className="h-64 w-[560px] rounded-md border"
		>
			<ResizablePanel defaultSize={40}>
				<div className="flex h-full items-center justify-center p-4 text-sm">
					火床のメモ
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={60}>
				<div className="flex h-full items-center justify-center p-4 text-sm">
					今夜の準備
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
};

/**
 * `direction="vertical"` で上下に並んだ 2 ペイン。タイムラインとログ、
 * プレビューとコンソール、のような構成に向く。
 * @summary 縦並び 2 ペインの形
 */
export const Vertical: Story = {
	render: () => (
		<ResizablePanelGroup
			orientation="vertical"
			className="h-80 w-[420px] rounded-md border"
		>
			<ResizablePanel defaultSize={50}>
				<div className="flex h-full items-center justify-center p-4 text-sm">
					夜の写真
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50}>
				<div className="flex h-full items-center justify-center p-4 text-sm">
					メモ書き
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
};
