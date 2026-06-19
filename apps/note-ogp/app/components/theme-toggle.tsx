import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import { useThemeDawn } from "ui/hooks/use-theme-dawn";

/**
 * アプリ UI のライト / ダークを切り替えるトグル。コントロールパネルの
 * 「テーマ」(書き出す OGP 画像のテーマ) とは独立して動くため、ラベルは
 * 「アプリを〜」で始めて区別する。
 *
 * useThemeDawn により、切替の瞬間に <html> へ `.hi-motion-dawn` が一時付与され、
 * 色が「夜明けのように」遷移する。
 */
export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useThemeDawn();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// hydration 前は dark 想定で描画してチラつきを抑える。tokens.css は
	// dark が初期状態 (`:root` がダーク基準) なので整合する。
	const isDark = !mounted || resolvedTheme === "dark";
	const nextLabel = isDark
		? "アプリをライトモードに切り替え"
		: "アプリをダークモードに切り替え";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					aria-label={nextLabel}
					onClick={() => setTheme(isDark ? "light" : "dark")}
					size="icon-sm"
					variant="ghost"
				>
					{isDark ? (
						<SunIcon strokeWidth={1.75} />
					) : (
						<MoonIcon strokeWidth={1.75} />
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent>{nextLabel}</TooltipContent>
		</Tooltip>
	);
}
