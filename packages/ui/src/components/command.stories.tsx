import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlameIcon, MapPinIcon, NotebookIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "./command";

/**
 * `cmdk` を Hidoko のトークン上に載せたコマンドパレット。検索でフィルタしつつ
 * 候補から 1 つ選んでアクションを発火する。Command 単体で「埋め込み型のリスト」
 * として、`CommandDialog` で「⌘K で呼び出すパレット」として使う。
 *
 * @summary コマンドパレット
 */
const meta = {
	title: "shadcn-ui/Command",
	component: Command,
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Card のような箱に埋め込んで使う基本形。Group で意味のある単位に分けて並べる。
 * @summary 埋め込み型のリスト
 */
export const Default: Story = {
	render: () => (
		<Command className="w-80 rounded-md border shadow-sm">
			<CommandInput placeholder="コマンドを検索..." />
			<CommandList>
				<CommandEmpty>該当なし</CommandEmpty>
				<CommandGroup heading="火床">
					<CommandItem>
						<FlameIcon />
						<span>新しい焚き火を始める</span>
						<CommandShortcut>⌘N</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<NotebookIcon />
						<span>夜のメモを開く</span>
						<CommandShortcut>⌘M</CommandShortcut>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="場所">
					<CommandItem>
						<MapPinIcon />
						<span>三軒茶屋</span>
					</CommandItem>
					<CommandItem>
						<MapPinIcon />
						<span>下北沢</span>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	),
};

/**
 * `⌘K` で呼び出すパレット。`CommandDialog` で Dialog ごとラップする。
 * 実機の挙動を確認するため、トリガボタンとキーボードショートカットの両方を
 * 用意している。
 * @summary ⌘K で呼び出すパレット
 */
export const Palette: Story = {
	render: () => {
		const [open, setOpen] = useState(false);

		useEffect(() => {
			const onKey = (e: KeyboardEvent) => {
				if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
					e.preventDefault();
					setOpen((prev) => !prev);
				}
			};
			document.addEventListener("keydown", onKey);
			return () => document.removeEventListener("keydown", onKey);
		}, []);

		return (
			<div className="flex flex-col items-start gap-3">
				<Button variant="outline" onClick={() => setOpen(true)}>
					<SearchIcon />
					コマンドパレットを開く
					<CommandShortcut>⌘K</CommandShortcut>
				</Button>
				<CommandDialog open={open} onOpenChange={setOpen}>
					<CommandInput placeholder="何をする？" />
					<CommandList>
						<CommandEmpty>該当なし</CommandEmpty>
						<CommandGroup heading="火床">
							<CommandItem onSelect={() => setOpen(false)}>
								<FlameIcon />
								<span>新しい焚き火を始める</span>
							</CommandItem>
							<CommandItem onSelect={() => setOpen(false)}>
								<NotebookIcon />
								<span>夜のメモを開く</span>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</CommandDialog>
			</div>
		);
	},
};

/**
 * 空状態。検索文字列に一致する候補がないときの見た目を確認する。
 * @summary 候補なしの空状態
 */
export const Empty: Story = {
	render: () => (
		<Command className="w-80 rounded-md border shadow-sm">
			<CommandInput
				placeholder="コマンドを検索..."
				defaultValue="存在しない文字列"
			/>
			<CommandList>
				<CommandEmpty>該当なし</CommandEmpty>
				<CommandGroup heading="火床">
					<CommandItem>
						<FlameIcon />
						<span>新しい焚き火を始める</span>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	),
};
