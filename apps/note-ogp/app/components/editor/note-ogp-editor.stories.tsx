import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { MemoryRouter } from "react-router";
import { TooltipProvider } from "ui";
import { NoteOgpEditor } from "./note-ogp-editor";

/**
 * note OGP エディタの全画面組み。md 以上では左に 1280×670 のテンプレ
 * プレビュー、右に入力パネルの 2 カラム。md 未満ではプレビューとパネルを
 * 縦積みにして、ページ全体のスクロールで全操作に届くようにする。
 * 入力は localStorage (`hidoko-note-ogp:v1`) に保存される。
 * 最下段の SiteFooter が `<Link>` を含むので、story では MemoryRouter で
 * wrap する。
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
					<MemoryRouter>
						<Story />
					</MemoryRouter>
				</TooltipProvider>
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof NoteOgpEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
