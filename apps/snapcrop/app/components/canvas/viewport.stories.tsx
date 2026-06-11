import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Viewport } from "./viewport";

/**
 * 画像を表示する pan / zoom コンテナ。OS 標準のスクロールバーを `overflow:auto`
 * で出し、⌘+wheel ズーム / wheel スクロール / 右クリックドラッグ pan /
 * Space + 左ドラッグ pan を提供する。Space 押下中は cursor が grab / grabbing
 * に変わり、子レイヤーの pointer-events を止めて pan を優先する。
 * Storybook では実画像の代わりに塗り潰しブロックを `children` として渡し、
 * コンテナと stage の関係を可視化する。
 *
 * @summary pan / zoom つき画像コンテナ
 */
const meta: Meta<typeof Viewport> = {
	title: "snapcrop/Canvas/Viewport",
	component: Viewport,
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;

type Story = StoryObj<typeof Viewport>;

function Stage({ width, height }: { width: number; height: number }) {
	return (
		<div
			className="absolute inset-0 bg-gradient-to-br from-[var(--ember-700)] via-[var(--ember-500)] to-[var(--moon)]"
			style={{ width: "100%", height: "100%" }}
		>
			<div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
				{width} × {height}
			</div>
		</div>
	);
}

/**
 * 初期表示は fit-to-container。画像の縦横比に応じて、padding を確保した上で
 * stage を中央に落とす。⌘ + wheel でズーム、右クリックドラッグまたは
 * Space + 左ドラッグで pan できる — Storybook の preview frame 上でも操作可能。
 * @summary fit 初期化
 */
export const Default: Story = {
	render: () => {
		const [zoom, setZoom] = useState(1);
		const image = { width: 1280, height: 720 };
		return (
			<div className="h-[480px] w-full bg-bg-base">
				<Viewport image={image} onZoomChange={setZoom} zoom={zoom}>
					<Stage height={image.height} width={image.width} />
				</Viewport>
			</div>
		);
	},
};

/**
 * 縦長画像 (スマホスクショ想定)。fit ズームでは画像の縦が優先され、左右に
 * 余白が出る。
 * @summary 縦長スクショ
 */
export const PortraitImage: Story = {
	render: () => {
		const [zoom, setZoom] = useState(1);
		const image = { width: 750, height: 1624 };
		return (
			<div className="h-[480px] w-full bg-bg-base">
				<Viewport image={image} onZoomChange={setZoom} zoom={zoom}>
					<Stage height={image.height} width={image.width} />
				</Viewport>
			</div>
		);
	},
};

/**
 * コンテナより小さな画像。`computeFitZoom` は 1 を上限にするので、拡大は
 * かからず原寸表示になる。余白だけが目立つ状態。
 * @summary コンテナ <<< 画像 (拡大しない)
 */
export const SmallImage: Story = {
	render: () => {
		const [zoom, setZoom] = useState(1);
		const image = { width: 320, height: 200 };
		return (
			<div className="h-[480px] w-full bg-bg-base">
				<Viewport image={image} onZoomChange={setZoom} zoom={zoom}>
					<Stage height={image.height} width={image.width} />
				</Viewport>
			</div>
		);
	},
};
