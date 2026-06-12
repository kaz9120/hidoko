import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "ui/components/tooltip";

import type { Rect } from "~/lib/annotation-bounds";

import { AnnotationMiniActions } from "./annotation-mini-actions";

/**
 * 選択中の注釈近傍に浮かぶミニアクションバー (複製 / 前面へ / 背面へ / 削除)。
 * 種別を問わず
 * 外接矩形 (bounds) を基準に配置する。stage 内に絶対配置されるが、バー自体は
 * CSS px 固定サイズなので zoom 倍率の影響を受けない。基本は注釈の上、上端で
 * 見切れるときは注釈の下、それも収まらないときは注釈の内側上へフォール
 * バックする。Storybook では stage に見立てた枠と選択注釈のダミー (破線) を
 * 重ねて配置ロジックを確認する。
 *
 * @summary 選択注釈のミニアクションバー
 */
const meta = {
	title: "snapcrop/Canvas/AnnotationMiniActions",
	component: AnnotationMiniActions,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story, ctx) => {
			const { bounds, zoom, imageWidth, imageHeight } = ctx.args;
			return (
				<TooltipProvider>
					<div
						className="relative overflow-hidden rounded-md border border-border bg-bg-raised"
						style={{ width: imageWidth * zoom, height: imageHeight * zoom }}
					>
						{/* 選択中の注釈のダミー (実 UI では各 SelectionOverlay が重なる) */}
						<div
							className="absolute border border-[var(--ember-400)] border-dashed"
							style={{
								left: bounds.x * zoom,
								top: bounds.y * zoom,
								width: bounds.width * zoom,
								height: bounds.height * zoom,
							}}
						/>
						<Story />
					</div>
				</TooltipProvider>
			);
		},
	],
} satisfies Meta<typeof AnnotationMiniActions>;

export default meta;

type Story = StoryObj<typeof meta>;

const mkBounds = (overrides: Partial<Rect>): Rect => ({
	x: 0,
	y: 0,
	width: 100,
	height: 60,
	...overrides,
});

const noop = () => {};

/**
 * 余白が十分あるときの基本形。バーは注釈の左上から GAP_PX (8px) 空けて
 * 真上に乗る。
 * @summary 注釈の上に表示
 */
export const Default: Story = {
	args: {
		bounds: mkBounds({ x: 160, y: 100, width: 200, height: 120 }),
		zoom: 1,
		imageWidth: 480,
		imageHeight: 280,
		onDuplicate: noop,
		onBringForward: noop,
		onSendBackward: noop,
		canBringForward: true,
		canSendBackward: true,
		onDelete: noop,
	},
};

/**
 * 注釈が stage 上端に近く、上に置くと見切れるケース。バーは注釈の下へ
 * フォールバックする。
 * @summary 上端での下フォールバック
 */
export const NearTopEdge: Story = {
	args: {
		bounds: mkBounds({ x: 160, y: 8, width: 200, height: 120 }),
		zoom: 1,
		imageWidth: 480,
		imageHeight: 280,
		onDuplicate: noop,
		onBringForward: noop,
		onSendBackward: noop,
		canBringForward: true,
		canSendBackward: true,
		onDelete: noop,
	},
};

/**
 * 注釈が stage のほぼ全面を占め、上にも下にも置けないケース。バーは注釈の
 * 内側上に重ねる。
 * @summary 内側へのフォールバック
 */
export const FullBleed: Story = {
	args: {
		bounds: mkBounds({ x: 8, y: 8, width: 464, height: 264 }),
		zoom: 1,
		imageWidth: 480,
		imageHeight: 280,
		onDuplicate: noop,
		onBringForward: noop,
		onSendBackward: noop,
		canBringForward: true,
		canSendBackward: true,
		onDelete: noop,
	},
};

/**
 * 注釈が stage 右端に張り付いているケース。バーの left は stage 幅に収まる
 * よう clamp され、右に見切れない。
 * @summary 右端での見切れ防止
 */
export const NearRightEdge: Story = {
	args: {
		bounds: mkBounds({ x: 430, y: 120, width: 50, height: 80 }),
		zoom: 1,
		imageWidth: 480,
		imageHeight: 280,
		onDuplicate: noop,
		onBringForward: noop,
		onSendBackward: noop,
		canBringForward: true,
		canSendBackward: true,
		onDelete: noop,
	},
};

/**
 * 水平に近い矢印やマーカーを想定した、高さの小さい bounds。線状の注釈でも
 * バーが外接矩形の真上に収まる。
 * @summary 線状注釈の bounds でも機能する
 */
export const FlatBounds: Story = {
	args: {
		bounds: mkBounds({ x: 120, y: 160, width: 240, height: 20 }),
		zoom: 1,
		imageWidth: 480,
		imageHeight: 280,
		onDuplicate: noop,
		onBringForward: noop,
		onSendBackward: noop,
		canBringForward: true,
		canSendBackward: true,
		onDelete: noop,
	},
};

/**
 * `zoom = 0.5` で縮小表示した場合。注釈の見た目は zoom で縮むが、バーは
 * CSS px 固定サイズなので大きさが変わらない。
 * @summary 縮小時もバーのサイズは一定
 */
export const ZoomedOut: Story = {
	args: {
		bounds: mkBounds({ x: 320, y: 200, width: 400, height: 240 }),
		zoom: 0.5,
		imageWidth: 960,
		imageHeight: 560,
		onDuplicate: noop,
		onBringForward: noop,
		onSendBackward: noop,
		canBringForward: true,
		canSendBackward: true,
		onDelete: noop,
	},
};

/**
 * 注釈が 1 つしかない (= 最前面かつ最背面) ときは、前面へ / 背面へ の両方が
 * disable される。複製・削除はそのまま使える。
 * @summary z 操作ボタンの disabled 状態
 */
export const ZOrderDisabled: Story = {
	args: {
		bounds: mkBounds({ x: 160, y: 100, width: 200, height: 120 }),
		zoom: 1,
		imageWidth: 480,
		imageHeight: 280,
		onDuplicate: noop,
		onBringForward: noop,
		onSendBackward: noop,
		canBringForward: false,
		canSendBackward: false,
		onDelete: noop,
	},
};
