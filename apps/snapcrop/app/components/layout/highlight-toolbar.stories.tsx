import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TooltipProvider } from "ui/components/tooltip";

import type { HighlightDefaults } from "~/lib/highlight-engine";
import {
	DEFAULT_HIGHLIGHT_DEFAULTS,
	HIGHLIGHT_PRESET_COLORS,
} from "~/lib/highlight-engine";

import { HighlightToolbarView } from "./highlight-toolbar";

/**
 * マーカーツール選択中だけ現れる 38px の context row。蛍光 5 色
 * (黄 / 橙 / 緑 / 青 / ピンク) のスウォッチ、不透明度スライダー
 * (デフォルト 40%)、太さ 3 段階を選ぶ。ハイライトが選択されているときは
 * そのハイライトのプロパティを書き換え、未選択のときは「次に引くマーカーの
 * デフォルト」を書き換える (arrow-toolbar と同じ規約)。
 *
 * 実装は context 接続の `HighlightToolbar` と props 駆動の
 * `HighlightToolbarView` に分かれている (ArrowToolbar / ZoomControl の先例)。
 * story は view を直接使い、表示状態・選択状態・操作の反映を確認する。
 *
 * @summary マーカーアノテーション用のサブツールバー
 */
const meta = {
	title: "snapcrop/Layout/HighlightToolbar",
	component: HighlightToolbarView,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<TooltipProvider>
				<div className="flex flex-col bg-[var(--ink-0)]">
					<Story />
					<div className="flex h-[120px] items-center justify-center text-muted-foreground text-sm">
						キャンバス領域 (story では未描画)
					</div>
				</div>
			</TooltipProvider>
		),
	],
} satisfies Meta<typeof HighlightToolbarView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** スウォッチ・スライダー・トグルの変更が即座に反映される stateful なラッパー。 */
function StatefulToolbar(props: {
	initial: HighlightDefaults;
	selected: boolean;
	highlightCount: number;
	withDelete?: boolean;
}) {
	const [current, setCurrent] = useState<HighlightDefaults>(props.initial);
	return (
		<HighlightToolbarView
			current={current}
			highlightCount={props.highlightCount}
			onCommit={(patch) => setCurrent((prev) => ({ ...prev, ...patch }))}
			onDelete={props.withDelete ? () => {} : undefined}
			selected={props.selected}
		/>
	);
}

/**
 * 未選択時。highlightDefaults (次に引くマーカーのデフォルト) を表示・編集する。
 * 蛍光 5 色・不透明度 40%・太さ md が初期値。
 * @summary 未選択 (デフォルト編集)
 */
export const Default: Story = {
	args: {
		current: DEFAULT_HIGHLIGHT_DEFAULTS,
		selected: false,
		highlightCount: 0,
		onCommit: () => {},
	},
	render: () => (
		<StatefulToolbar
			highlightCount={0}
			initial={DEFAULT_HIGHLIGHT_DEFAULTS}
			selected={false}
		/>
	),
};

/**
 * マーカーを選択しているとき。ラベルが accent 色の「選択中」になり、右端に
 * 削除ボタンが出る。値は選択中のマーカーのプロパティを反映する。
 * @summary 選択中 (緑・不透明度 60%)
 */
export const Selected: Story = {
	args: {
		current: DEFAULT_HIGHLIGHT_DEFAULTS,
		selected: true,
		highlightCount: 3,
		onCommit: () => {},
	},
	render: () => (
		<StatefulToolbar
			highlightCount={3}
			initial={{
				color: HIGHLIGHT_PRESET_COLORS[2],
				opacity: 0.6,
				thickness: "md",
			}}
			selected={true}
			withDelete
		/>
	),
};

/**
 * 太さ lg + ピンクを選んだ状態。太さトグルのバーの高さとスウォッチの選択
 * リングが対応して動くことを確認する。
 * @summary 太さ lg・ピンク
 */
export const ThickPink: Story = {
	args: {
		current: DEFAULT_HIGHLIGHT_DEFAULTS,
		selected: false,
		highlightCount: 1,
		onCommit: () => {},
	},
	render: () => (
		<StatefulToolbar
			highlightCount={1}
			initial={{
				color: HIGHLIGHT_PRESET_COLORS[4],
				opacity: 0.4,
				thickness: "lg",
			}}
			selected={false}
		/>
	),
};
