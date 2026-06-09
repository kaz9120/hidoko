import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";

import { BottomNav } from "./BottomNav";

/**
 * 画面下の 3 タブ (ホーム / カレンダー / 設定)。アクティブタブは accent 色 +
 * 上端の小さなインジケータで示し、`aria-current` でも示す。NavLink を使う
 * ので、story では MemoryRouter で wrap する必要がある。
 *
 * `parameters.router.initialPath` で active 表示の対象を切り替える。
 *
 * @summary 下部 3 タブ
 */
const meta = {
	title: "futari-no-yotei/Layout/BottomNav",
	component: BottomNav,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story, context) => {
			const routerParams = context.parameters?.router as
				| { initialPath?: string }
				| undefined;
			const initialPath = routerParams?.initialPath ?? "/";
			return (
				<MemoryRouter initialEntries={[initialPath]}>
					<div className="mx-auto flex min-h-dvh max-w-md flex-col justify-end bg-bg">
						<Story />
					</div>
				</MemoryRouter>
			);
		},
	],
} satisfies Meta<typeof BottomNav>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * ホームタブが active。アプリ起動直後の状態。
 * @summary ホームが active
 */
export const HomeActive: Story = {
	parameters: {
		router: { initialPath: "/" },
	},
};

/**
 * カレンダータブが active。週ビュー (/week) を見ている状態。
 * @summary カレンダーが active
 */
export const WeekActive: Story = {
	parameters: {
		router: { initialPath: "/week" },
	},
};

/**
 * 設定タブが active。ステータス項目編集画面を開いている状態。
 * @summary 設定が active
 */
export const SettingsActive: Story = {
	parameters: {
		router: { initialPath: "/settings/status-items" },
	},
};
