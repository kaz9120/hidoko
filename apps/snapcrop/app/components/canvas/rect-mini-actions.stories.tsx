import type { Meta, StoryObj } from "@storybook/react-vite";

import type { RectAnnotation } from "~/lib/rect-engine";

import { RectMiniActions } from "./rect-mini-actions";

/**
 * 選択中の矩形近傍に浮かぶミニアクションバー (複製 / 削除)。stage 内に絶対
 * 配置されるが、バー自体は CSS px 固定サイズなので zoom 倍率の影響を受けない。
 * 基本は矩形の上、上端で見切れるときは矩形の下、それも収まらないときは矩形の
 * 内側上へフォールバックする。Storybook では stage に見立てた枠と選択矩形の
 * ダミー (破線) を重ねて配置ロジックを確認する。
 *
 * @summary 選択矩形のミニアクションバー
 */
const meta = {
	title: "snapcrop/Canvas/RectMiniActions",
	component: RectMiniActions,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story, ctx) => {
			const { annotation, zoom, imageWidth, imageHeight } = ctx.args;
			return (
				<div
					className="relative overflow-hidden rounded-md border border-border bg-bg-raised"
					style={{ width: imageWidth * zoom, height: imageHeight * zoom }}
				>
					{/* 選択中の矩形のダミー (実 UI では RectSelectionOverlay が重なる) */}
					<div
						className="absolute border border-[var(--ember-400)] border-dashed"
						style={{
							left: annotation.x * zoom,
							top: annotation.y * zoom,
							width: annotation.width * zoom,
							height: annotation.height * zoom,
						}}
					/>
					<Story />
				</div>
			);
		},
	],
} satisfies Meta<typeof RectMiniActions>;

export default meta;

type Story = StoryObj<typeof meta>;

const mkRect = (overrides: Partial<RectAnnotation>): RectAnnotation => ({
	id: "sel-1",
	kind: "rect",
	x: 0,
	y: 0,
	width: 100,
	height: 60,
	style: "outline",
	color: "#ef4444",
	thickness: "md",
	createdAt: 0,
	...overrides,
});

const noop = () => {};

/**
 * 余白が十分あるときの基本形。バーは矩形の左上から GAP_PX (8px) 空けて
 * 真上に乗る。
 * @summary 矩形の上に表示
 */
export const Default: Story = {
	args: {
		annotation: mkRect({ x: 160, y: 100, width: 200, height: 120 }),
		zoom: 1,
		imageWidth: 480,
		imageHeight: 280,
		onDuplicate: noop,
		onDelete: noop,
	},
};

/**
 * 矩形が stage 上端に近く、上に置くと見切れるケース。バーは矩形の下へ
 * フォールバックする。
 * @summary 上端での下フォールバック
 */
export const NearTopEdge: Story = {
	args: {
		annotation: mkRect({ x: 160, y: 8, width: 200, height: 120 }),
		zoom: 1,
		imageWidth: 480,
		imageHeight: 280,
		onDuplicate: noop,
		onDelete: noop,
	},
};

/**
 * 矩形が stage のほぼ全面を占め、上にも下にも置けないケース。バーは矩形の
 * 内側上に重ねる。
 * @summary 内側へのフォールバック
 */
export const FullBleed: Story = {
	args: {
		annotation: mkRect({ x: 8, y: 8, width: 464, height: 264 }),
		zoom: 1,
		imageWidth: 480,
		imageHeight: 280,
		onDuplicate: noop,
		onDelete: noop,
	},
};

/**
 * 矩形が stage 右端に張り付いているケース。バーの left は stage 幅に収まる
 * よう clamp され、右に見切れない。
 * @summary 右端での見切れ防止
 */
export const NearRightEdge: Story = {
	args: {
		annotation: mkRect({ x: 430, y: 120, width: 50, height: 80 }),
		zoom: 1,
		imageWidth: 480,
		imageHeight: 280,
		onDuplicate: noop,
		onDelete: noop,
	},
};

/**
 * `zoom = 0.5` で縮小表示した場合。矩形の見た目は zoom で縮むが、バーは
 * CSS px 固定サイズなので大きさが変わらない。
 * @summary 縮小時もバーのサイズは一定
 */
export const ZoomedOut: Story = {
	args: {
		annotation: mkRect({ x: 320, y: 200, width: 400, height: 240 }),
		zoom: 0.5,
		imageWidth: 960,
		imageHeight: 560,
		onDuplicate: noop,
		onDelete: noop,
	},
};
