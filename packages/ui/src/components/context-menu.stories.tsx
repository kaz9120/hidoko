import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "./context-menu";

/**
 * 右クリック（タッチでは長押し）で開く menu。Radix の `ContextMenu` を
 * Hidoko のトークン上に載せた wrapper。デスクトップ寄りのアプリで、領域
 * そのものに対する操作群を出すときに使う。
 *
 * @summary 右クリックで開く menu
 */
const meta = {
	title: "shadcn-ui/ContextMenu",
	component: ContextMenu,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof ContextMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 大きな点線の領域を右クリックして menu を出す基本形。何をトリガにできる
 * かを破線の四角で可視化している。
 * @summary 領域を右クリックする基本形
 */
export const Default: Story = {
	render: () => (
		<ContextMenu>
			<ContextMenuTrigger className="flex h-44 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
				ここを右クリック
			</ContextMenuTrigger>
			<ContextMenuContent className="w-56">
				<ContextMenuItem>
					戻る
					<ContextMenuShortcut>⌘[</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					進む
					<ContextMenuShortcut>⌘]</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem>再読み込み</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem variant="destructive">削除</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	),
};

/**
 * 入れ子 menu を持つ用例。サブメニューに「共有先」等の選択肢を畳んでおく
 * ことで、トップは短く保てる。
 * @summary サブメニュー入り
 */
export const WithSubmenu: Story = {
	render: () => (
		<ContextMenu>
			<ContextMenuTrigger className="flex h-44 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
				右クリックで開く
			</ContextMenuTrigger>
			<ContextMenuContent className="w-56">
				<ContextMenuItem>開く</ContextMenuItem>
				<ContextMenuItem>複製</ContextMenuItem>
				<ContextMenuSub>
					<ContextMenuSubTrigger>共有先</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<ContextMenuItem>三軒茶屋のグループ</ContextMenuItem>
						<ContextMenuItem>家族</ContextMenuItem>
						<ContextMenuItem>リンクをコピー</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuSeparator />
				<ContextMenuItem variant="destructive">削除</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	),
};

/**
 * Checkbox と Radio を組み合わせた用例。表示設定や並び替えを menu の中で
 * 切り替える。`useState` で controlled にしている。
 * @summary checkbox と radio の組み合わせ
 */
export const WithChoices: Story = {
	render: () => {
		const [showShortcuts, setShowShortcuts] = useState(true);
		const [order, setOrder] = useState("recent");
		return (
			<ContextMenu>
				<ContextMenuTrigger className="flex h-44 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
					右クリックで開く
				</ContextMenuTrigger>
				<ContextMenuContent className="w-56">
					<ContextMenuLabel>表示</ContextMenuLabel>
					<ContextMenuCheckboxItem
						checked={showShortcuts}
						onCheckedChange={setShowShortcuts}
					>
						ショートカットを表示
					</ContextMenuCheckboxItem>
					<ContextMenuSeparator />
					<ContextMenuLabel>並び順</ContextMenuLabel>
					<ContextMenuRadioGroup value={order} onValueChange={setOrder}>
						<ContextMenuRadioItem value="recent">
							更新が新しい順
						</ContextMenuRadioItem>
						<ContextMenuRadioItem value="name">名前順</ContextMenuRadioItem>
						<ContextMenuRadioItem value="created">
							作成が古い順
						</ContextMenuRadioItem>
					</ContextMenuRadioGroup>
				</ContextMenuContent>
			</ContextMenu>
		);
	},
};
