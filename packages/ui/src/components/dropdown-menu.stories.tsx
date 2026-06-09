import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "./button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "./dropdown-menu";

/**
 * トリガをクリックして開く menu。Radix の `DropdownMenu` を Hidoko の
 * トークン上に載せた wrapper。リスト行末の「3 点メニュー」や、ヘッダの
 * ユーザーメニューなど、対象に対する操作群を畳むときに使う。
 *
 * @summary トリガで開く操作メニュー
 */
const meta = {
	title: "shadcn-ui/DropdownMenu",
	component: DropdownMenu,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * リスト行末の 3 点メニューを想定した基本形。基本操作と削除の destructive
 * を分けて、危険な操作だけ色で区別する。
 * @summary 3 点メニュー風の基本形
 */
export const Default: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<MoreHorizontalIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuLabel>項目の操作</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					編集
					<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>複製</DropdownMenuItem>
				<DropdownMenuItem>共有</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive">
					削除
					<DropdownMenuShortcut>⌫</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

/**
 * Checkbox と Radio を含む用例。表示・並び順を menu の中で切り替える、
 * テーブルのフィルタ風の使い方。
 * @summary checkbox と radio の組み合わせ
 */
export const WithChoices: Story = {
	render: () => {
		const [showArchived, setShowArchived] = useState(false);
		const [showDraft, setShowDraft] = useState(true);
		const [sort, setSort] = useState("updated");
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">表示の設定</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>表示</DropdownMenuLabel>
					<DropdownMenuCheckboxItem
						checked={showDraft}
						onCheckedChange={setShowDraft}
					>
						下書きを含める
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						checked={showArchived}
						onCheckedChange={setShowArchived}
					>
						アーカイブも見る
					</DropdownMenuCheckboxItem>
					<DropdownMenuSeparator />
					<DropdownMenuLabel>並び順</DropdownMenuLabel>
					<DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
						<DropdownMenuRadioItem value="updated">
							更新が新しい順
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="created">
							作成が古い順
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="name">名前順</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
};

/**
 * 入れ子 menu を持つ用例。サブメニューに「移動先」や「共有先」を畳んで、
 * トップ階層を短く保つ。
 * @summary サブメニュー入り
 */
export const WithSubmenu: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">操作</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuItem>開く</DropdownMenuItem>
				<DropdownMenuItem>複製</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>移動先</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem>焚き火の記録</DropdownMenuItem>
						<DropdownMenuItem>三軒茶屋メモ</DropdownMenuItem>
						<DropdownMenuItem>アーカイブ</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive">削除</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};
