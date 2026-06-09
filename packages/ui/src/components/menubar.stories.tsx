import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from "./menubar";

/**
 * アプリの上端に置く水平 menu。Radix の `Menubar` を Hidoko のトークン上
 * に載せた wrapper。デスクトップ風アプリで「ファイル / 編集 / 表示」の
 * ような恒常的なグローバル操作を出すときに使う。
 *
 * @summary アプリ上端の水平 menu
 */
const meta = {
	title: "shadcn-ui/Menubar",
	component: Menubar,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Menubar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * ファイル / 編集 / 表示 の 3 メニューを並べた、デスクトップ風の典型例。
 * @summary ファイル / 編集 / 表示
 */
export const Default: Story = {
	render: () => (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>ファイル</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						新規作成
						<MenubarShortcut>⌘N</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						開く
						<MenubarShortcut>⌘O</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>
						保存
						<MenubarShortcut>⌘S</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem variant="destructive">閉じる</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>編集</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						元に戻す
						<MenubarShortcut>⌘Z</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						やり直す
						<MenubarShortcut>⇧⌘Z</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>切り取り</MenubarItem>
					<MenubarItem>コピー</MenubarItem>
					<MenubarItem>貼り付け</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>表示</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>サイドバーを隠す</MenubarItem>
					<MenubarItem>フルスクリーン</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	),
};

/**
 * サブメニュー入りの「ファイル」メニュー。「最近開いた項目」を畳んで、
 * トップ階層を短く保つ用例。
 * @summary サブメニュー入り
 */
export const WithSubmenu: Story = {
	render: () => (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>ファイル</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>新規作成</MenubarItem>
					<MenubarItem>開く</MenubarItem>
					<MenubarSub>
						<MenubarSubTrigger>最近開いた項目</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem>三軒茶屋ノート</MenubarItem>
							<MenubarItem>焚き火の記録</MenubarItem>
							<MenubarItem>今週の段取り</MenubarItem>
						</MenubarSubContent>
					</MenubarSub>
					<MenubarSeparator />
					<MenubarItem>保存</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	),
};

/**
 * Checkbox と Radio を含む「表示」メニュー。表示状態と表示モードを切り替
 * える典型例。
 * @summary checkbox と radio の組み合わせ
 */
export const WithChoices: Story = {
	render: () => {
		const [showSidebar, setShowSidebar] = useState(true);
		const [theme, setTheme] = useState("system");
		return (
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger>表示</MenubarTrigger>
					<MenubarContent>
						<MenubarCheckboxItem
							checked={showSidebar}
							onCheckedChange={setShowSidebar}
						>
							サイドバーを表示
						</MenubarCheckboxItem>
						<MenubarSeparator />
						<MenubarRadioGroup value={theme} onValueChange={setTheme}>
							<MenubarRadioItem value="light">ライト</MenubarRadioItem>
							<MenubarRadioItem value="dark">ダーク</MenubarRadioItem>
							<MenubarRadioItem value="system">システムに合わせる</MenubarRadioItem>
						</MenubarRadioGroup>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
		);
	},
};
