import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TooltipProvider } from "ui/components/tooltip";

import type { ArrowDefaults } from "~/lib/arrow-engine";
import { DEFAULT_ARROW_DEFAULTS } from "~/lib/arrow-engine";
import { PRESET_COLORS } from "~/lib/rect-engine";

import { ArrowToolbarView } from "./arrow-toolbar";

/**
 * 矢印ツール選択中だけ現れる 38px の context row。線形 (直線 / 曲線)、
 * 始点・終点の端点スタイル (なし / 矢印 / 丸)、色スウォッチ (矩形と共通の
 * プリセット 6 色)、太さ 3 段階を選ぶ。矢印が選択されているときはその矢印の
 * プロパティを書き換え、未選択のときは「次に描く矢印のデフォルト」を
 * 書き換える (rect-toolbar と同じ規約)。
 *
 * 実装は context 接続の `ArrowToolbar` と props 駆動の `ArrowToolbarView` に
 * 分かれている (ZoomControl / StatusBar の先例)。story は view を直接使い、
 * 表示状態・選択状態・操作の反映を確認する。
 *
 * @summary 矢印アノテーション用のサブツールバー
 */
const meta = {
	title: "snapcrop/Layout/ArrowToolbar",
	component: ArrowToolbarView,
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
} satisfies Meta<typeof ArrowToolbarView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** トグルや色の変更が即座に反映される stateful なラッパー。 */
function StatefulToolbar(props: {
	initial: ArrowDefaults;
	selected: boolean;
	arrowCount: number;
	withDelete?: boolean;
}) {
	const [current, setCurrent] = useState<ArrowDefaults>(props.initial);
	return (
		<ArrowToolbarView
			arrowCount={props.arrowCount}
			current={current}
			onCommit={(patch) => setCurrent((prev) => ({ ...prev, ...patch }))}
			onDelete={props.withDelete ? () => {} : undefined}
			selected={props.selected}
		/>
	);
}

/**
 * 未選択時。arrowDefaults (次に描く矢印のデフォルト) を表示・編集する。
 * トグルをクリックすると選択状態が切り替わる。
 * @summary 未選択 (デフォルト編集)
 */
export const Default: Story = {
	args: {
		current: DEFAULT_ARROW_DEFAULTS,
		selected: false,
		arrowCount: 0,
		onCommit: () => {},
	},
	render: () => (
		<StatefulToolbar
			arrowCount={0}
			initial={DEFAULT_ARROW_DEFAULTS}
			selected={false}
		/>
	),
};

/**
 * 矢印を選択しているとき。ラベルが accent 色の「選択中」になり、右端に
 * 削除ボタンが出る。値は選択中の矢印のプロパティを反映する。
 * @summary 選択中 (曲線・始点丸)
 */
export const Selected: Story = {
	args: {
		current: DEFAULT_ARROW_DEFAULTS,
		selected: true,
		arrowCount: 3,
		onCommit: () => {},
	},
	render: () => (
		<StatefulToolbar
			arrowCount={3}
			initial={{
				line: "curve",
				startCap: "dot",
				endCap: "arrow",
				color: PRESET_COLORS[2],
				thickness: "md",
				style: "clean",
			}}
			selected={true}
			withDelete
		/>
	),
};

/**
 * 太さ lg + 青を選んだ状態。太さトグルのバーの高さと色スウォッチの選択
 * リングが対応して動くことを確認する。
 * @summary 太さ lg・青
 */
export const ThickBlue: Story = {
	args: {
		current: DEFAULT_ARROW_DEFAULTS,
		selected: false,
		arrowCount: 1,
		onCommit: () => {},
	},
	render: () => (
		<StatefulToolbar
			arrowCount={1}
			initial={{
				line: "straight",
				startCap: "none",
				endCap: "arrow",
				color: PRESET_COLORS[4],
				thickness: "lg",
				style: "clean",
			}}
			selected={false}
		/>
	),
};

/**
 * 線の質感を「手書き」にした状態。きっちり / 手書きの 2 択トグルが
 * 手書き側で点灯する。
 * @summary 手書きスタイル選択中
 */
export const SketchyStyle: Story = {
	args: {
		current: DEFAULT_ARROW_DEFAULTS,
		selected: false,
		arrowCount: 2,
		onCommit: () => {},
	},
	render: () => (
		<StatefulToolbar
			arrowCount={2}
			initial={{ ...DEFAULT_ARROW_DEFAULTS, style: "sketchy" }}
			selected={false}
		/>
	),
};
