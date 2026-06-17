import { CircleHelpIcon, ExternalLinkIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "ui/components/dialog";
import { Kbd, KbdGroup } from "ui/components/kbd";

type Shortcut = {
	keys: readonly string[];
	description: string;
};

type ShortcutSection = {
	heading: string;
	shortcuts: readonly Shortcut[];
};

/**
 * 実装済みショートカットの一覧。実体は各 hooks にある:
 *   - ⌘C        → use-copy-shortcut.ts
 *   - ⌘V        → use-clipboard-paste.ts (paste イベント)
 *   - ⌘A        → use-select-all-shortcut.ts
 *   - ⌘Z / ⌘⇧Z → site-header.tsx
 *   - ⌘D        → use-duplicate-shortcut.ts
 *   - ] / [     → use-z-order-shortcuts.ts (⌘ 付きで最前面 / 最背面)
 *   - ⌘0 / ⌘1  → use-canvas-shortcuts.ts
 *   - Space pan → components/canvas/viewport.tsx
 *   - ⇧ ドラッグ → lib/constrain.ts (各 engine hook が適用)
 *   - ⌥ ドラッグ → components/canvas/annotation-interaction-layer.tsx
 *   - A / T / H → use-arrow-shortcuts.ts / use-text-shortcuts.ts /
 *                 use-highlight-shortcuts.ts
 *   - それ以外   → use-rect-shortcuts.ts
 * ショートカットを追加・変更したら、この一覧も一緒に更新すること。
 */
const SECTIONS: readonly ShortcutSection[] = [
	{
		heading: "画像",
		shortcuts: [
			{ keys: ["⌘", "V"], description: "クリップボードの画像を読み込む" },
			{ keys: ["⌘", "C"], description: "クロップ結果をコピーする" },
		],
	},
	{
		heading: "編集",
		shortcuts: [
			{ keys: ["⌘", "Z"], description: "元に戻す" },
			{ keys: ["⌘", "⇧", "Z"], description: "やり直す" },
			{ keys: ["⌘", "A"], description: "クロップ範囲を画像全体に広げる" },
		],
	},
	{
		heading: "表示",
		shortcuts: [
			{ keys: ["⌘", "0"], description: "ウィンドウに合わせる" },
			{ keys: ["⌘", "1"], description: "100% 表示にする" },
			{ keys: ["Space"], description: "押しながらドラッグでキャンバスをパン" },
		],
	},
	{
		heading: "ツール",
		shortcuts: [
			{ keys: ["V"], description: "クロップツールに切り替え" },
			{ keys: ["R"], description: "矩形ツールに切り替え" },
			{ keys: ["A"], description: "矢印ツールに切り替え" },
			{ keys: ["T"], description: "テキストツールに切り替え" },
			{ keys: ["H"], description: "マーカーツールに切り替え" },
			{ keys: ["M"], description: "モザイクツールに切り替え" },
		],
	},
	{
		heading: "描画",
		shortcuts: [
			{
				keys: ["⇧"],
				description: "押しながらドラッグで拘束 (正方形 / 45° / 水平垂直)",
			},
		],
	},
	{
		heading: "注釈",
		shortcuts: [
			{ keys: ["Esc"], description: "描画を破棄 / 選択を解除" },
			{ keys: ["⌫"], description: "選択中の注釈を削除" },
			{ keys: ["⌘", "D"], description: "選択中の注釈を複製" },
			{ keys: ["⌥", "ドラッグ"], description: "注釈を複製してドラッグ" },
			{ keys: ["]"], description: "選択中の注釈を前面へ" },
			{ keys: ["["], description: "選択中の注釈を背面へ" },
			{ keys: ["⌘", "]"], description: "最前面へ" },
			{ keys: ["⌘", "["], description: "最背面へ" },
			{ keys: ["↑↓←→"], description: "選択中の注釈を 1px 移動" },
			{ keys: ["⇧", "↑↓←→"], description: "10px 移動" },
			{ keys: ["⌥", "↑↓←→"], description: "矩形の右辺 / 下辺をリサイズ" },
		],
	},
] as const;

const AUTHOR_LINKS = [
	{ label: "@kyamamoto9120", href: "https://x.com/kyamamoto9120" },
	{ label: "y-kaz.com", href: "https://y-kaz.com/" },
] as const;

/**
 * ヘッダ右クラスタのヘルプボタンと、それが開くショートカット一覧ダイアログ。
 * `?` キーでも開ける (use-rect-shortcuts.ts の先例に揃え、入力欄フォーカス中と
 * IME 入力中は反応しない)。閲覧専用で編集状態を持たないので、外タップ / Esc で
 * そのまま閉じてよい。末尾に作者リンクを並べる。
 */
export function HelpDialog() {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (event.key !== "?") return;
			if (event.isComposing || event.keyCode === 229) return;
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}
			event.preventDefault();
			setOpen(true);
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						aria-label="ヘルプ (?)"
						onClick={() => setOpen(true)}
						size="icon-sm"
						variant="ghost"
					>
						<CircleHelpIcon strokeWidth={1.75} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>ヘルプ (?)</TooltipContent>
			</Tooltip>

			<Dialog onOpenChange={setOpen} open={open}>
				<DialogContent className="max-h-[85dvh] max-w-md overflow-y-auto">
					<DialogHeader>
						<DialogTitle>キーボードショートカット</DialogTitle>
						<DialogDescription>
							Windows / Linux では ⌘ を Ctrl に読み替えてください。
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-4">
						{SECTIONS.map((section) => (
							<section key={section.heading}>
								<h3 className="mb-1.5 font-mono text-[11px] text-muted-foreground tracking-[0.08em] uppercase">
									{section.heading}
								</h3>
								<dl className="flex flex-col">
									{section.shortcuts.map((shortcut) => (
										<div
											className="flex items-center justify-between gap-4 py-1"
											key={shortcut.description}
										>
											<dt className="text-foreground text-sm">
												{shortcut.description}
											</dt>
											<dd>
												<KbdGroup>
													{shortcut.keys.map((key, index) => (
														<Fragment key={key}>
															{index > 0 && (
																<span
																	aria-hidden="true"
																	className="text-muted-foreground text-xs"
																>
																	+
																</span>
															)}
															<Kbd>{key}</Kbd>
														</Fragment>
													))}
												</KbdGroup>
											</dd>
										</div>
									))}
								</dl>
							</section>
						))}
					</div>

					<footer className="flex items-center gap-3 border-border border-t pt-3">
						<span className="text-muted-foreground text-xs">powered by</span>
						{AUTHOR_LINKS.map((link) => (
							<a
								className="inline-flex items-center gap-1 text-foreground text-xs underline-offset-2 hover:underline"
								href={link.href}
								key={link.href}
								rel="noreferrer"
								target="_blank"
							>
								{link.label}
								<ExternalLinkIcon aria-hidden="true" className="size-3" />
							</a>
						))}
					</footer>
				</DialogContent>
			</Dialog>
		</>
	);
}
