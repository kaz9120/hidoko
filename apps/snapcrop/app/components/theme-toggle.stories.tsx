import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "takibi-design-system";

import { ThemeToggle } from "./theme-toggle";

/**
 * 右上に座る小さなテーマ切替ボタン。Takibi の `useThemePreference` を読み、
 * 夜なら月、昼なら太陽のアイコンを出して、押すと反対側に切り替わる。
 * 火床の夜時間と昼時間を行き来するためのスイッチ。
 *
 * @summary テーマ切替ボタン
 */
const meta = {
	title: "snapcrop/ThemeToggle",
	component: ThemeToggle,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		),
	],
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 初期表示。Storybook 自体が夜で立ち上がるので、ボタンには月のアイコンが
 * 出る (押すと昼に切り替わる)。
 * @summary 既定の表示
 */
export const Default: Story = {};
