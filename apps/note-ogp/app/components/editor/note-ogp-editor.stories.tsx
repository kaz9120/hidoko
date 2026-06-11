import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "ui";
import { NoteOgpEditor } from "./note-ogp-editor";

/**
 * note OGP エディタの全画面組み。左に 1280×670 のテンプレプレビュー、右に
 * 入力パネル。入力は localStorage (`hidoko-note-ogp:v1`) に保存される。
 *
 * @summary 1 画面まるごとのエディタ
 */
const meta = {
	title: "note-ogp/Editor/NoteOgpEditor",
	component: NoteOgpEditor,
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="dark">
				<TooltipProvider>
					<Story />
				</TooltipProvider>
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof NoteOgpEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
