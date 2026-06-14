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
 * マーカーツール選択中だけ現れる 38px の context row。「次に引くマーカーの
 * デフォルト」を編集する。選択中のマーカーのプロパティ編集は bbox 近傍の
 * フローティング (HighlightFloatingToolbar / #147 Phase 3) に集約されているので
 * こちらには出てこない。
 *
 * 実装は context 接続の `HighlightToolbar` と props 駆動の
 * `HighlightToolbarView` に分かれている (ArrowToolbar / ZoomControl の先例)。
 * story は view を直接使い、表示状態・操作の反映を確認する。
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
	highlightCount: number;
}) {
	const [current, setCurrent] = useState<HighlightDefaults>(props.initial);
	return (
		<HighlightToolbarView
			current={current}
			highlightCount={props.highlightCount}
			onCommit={(patch) => setCurrent((prev) => ({ ...prev, ...patch }))}
		/>
	);
}

/**
 * デフォルト表示。highlightDefaults (次に引くマーカーのデフォルト) を編集する。
 * 蛍光 5 色・不透明度 40%・太さ md が初期値。
 * @summary デフォルト編集
 */
export const Default: Story = {
	args: {
		current: DEFAULT_HIGHLIGHT_DEFAULTS,
		highlightCount: 0,
		onCommit: () => {},
	},
	render: () => (
		<StatefulToolbar highlightCount={0} initial={DEFAULT_HIGHLIGHT_DEFAULTS} />
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
				strokeStyle: "clean",
			}}
		/>
	),
};
