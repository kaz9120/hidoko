import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	type LoadedImage,
	SnapcropProvider,
} from "~/contexts/snapcrop-context";

import { StatusBar, StatusBarView } from "./status-bar";

/**
 * 画面下端 24px の細い情報帯。ファイル名・画像のサイズ・形式・容量と、
 * 選択範囲 (寸法 + 出力推定容量)・図形数・履歴位置を等幅フォントで横一列に
 * 詰める。火床の夜に光る計器盤のような立ち位置で、視線を奪わず、必要な
 * ときだけ目で拾える。
 *
 * `StatusBar` は `SnapcropContext` から値を読む薄い容れ物で、表示の本体は
 * `StatusBarView`。Storybook では画像ロード後の状態を `StatusBarView` に
 * props を渡して直接組み立てる。
 *
 * @summary 画面下端のステータスバー
 */
const meta = {
	title: "snapcrop/Layout/StatusBar",
	component: StatusBar,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<SnapcropProvider>
				<Story />
			</SnapcropProvider>
		),
	],
} satisfies Meta<typeof StatusBar>;

export default meta;

type Story = StoryObj<typeof meta>;

const SAMPLE_IMAGE: LoadedImage = {
	src: "",
	blob: new Blob(),
	width: 2880,
	height: 1800,
	format: "image/png",
	fileSize: 3_355_443, // 3.2 MB
	fileName: "screenshot-20260610-093045.png",
};

/**
 * 画像未ロードの初期状態。「画像が未ロードです」と「⌘V で貼り付け」だけが
 * 並ぶ最小表示。
 * @summary 画像未ロード時
 */
export const Default: Story = {};

/**
 * 画像ロード + 選択範囲ありの通常状態。左にファイル名・元画像の寸法・形式・
 * 容量、右に選択寸法と出力推定容量 (面積比からの概算)・図形数・履歴位置が
 * 並ぶ。
 * @summary 画像ロード + 選択あり
 */
export const Loaded: Story = {
	render: () => (
		<StatusBarView
			annotationCount={3}
			cropData={{ x: 120, y: 90, width: 1280, height: 720 }}
			historyIndex={1}
			historyLength={4}
			image={SAMPLE_IMAGE}
		/>
	),
};

/**
 * 選択範囲がまだ確定していない状態。選択は「—」になり、推定容量も出さない。
 * @summary 選択範囲なし
 */
export const NoSelection: Story = {
	render: () => (
		<StatusBarView
			annotationCount={0}
			cropData={null}
			historyIndex={0}
			historyLength={1}
			image={SAMPLE_IMAGE}
		/>
	),
};

/**
 * 長いファイル名は 200px で切って ellipsis にする。フル名は title 属性
 * (hover tooltip) で確認できる。
 * @summary 長いファイル名の truncate
 */
export const LongFileName: Story = {
	render: () => (
		<StatusBarView
			annotationCount={12}
			cropData={{ x: 0, y: 0, width: 2880, height: 1800 }}
			historyIndex={2}
			historyLength={3}
			image={{
				...SAMPLE_IMAGE,
				fileName:
					"とても長いファイル名のスクリーンショット-プロジェクト資料-最終版-v3-20260610.png",
			}}
		/>
	),
};
