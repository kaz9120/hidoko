import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Button,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	useThemePreference,
} from "takibi-design-system";

/**
 * アプリ UI の夜 / 昼を切り替えるトグル。コントロールパネルの
 * 「テーマ」(書き出す OGP 画像のテーマ) とは独立して動くため、ラベルは
 * 「アプリを〜」で始めて区別する。
 *
 * 設定は Takibi の useThemePreference で localStorage の `takibi-theme` に保存し、
 * 切り替えは Takibi の setTheme が画面全体を 1 回のクロスフェードで行う。
 */
export function ThemeToggle() {
	const { theme, setPreference } = useThemePreference();
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	// prerender の HTML は夜で描かれている。hydration が済むまでは夜として描き、
	// 描く前に昼を当てた画面でも React の hydration 不一致を起こさない
	const isDark = !mounted || theme === "dark";
	const nextLabel = isDark
		? "アプリをライトモードに切り替え"
		: "アプリをダークモードに切り替え";

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						aria-label={nextLabel}
						onClick={() => setPreference(isDark ? "light" : "dark")}
						size="icon-sm"
						variant="ghost"
					/>
				}
			>
				{isDark ? <SunIcon /> : <MoonIcon />}
			</TooltipTrigger>
			<TooltipContent>{nextLabel}</TooltipContent>
		</Tooltip>
	);
}
