import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import { useThemeDawn } from "ui/hooks/use-theme-dawn";

export function ThemeToggle() {
	// useThemeDawn は next-themes をラップし、テーマ切替時に
	// `.hi-motion-dawn` を <html> に一時付与する。夜明けのように色がゆっくり移る。
	const { resolvedTheme, setTheme } = useThemeDawn();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// hydration 前は dark 想定で描画してチラつきを抑える。tokens.css は
	// dark が初期状態 (`:root` がダーク基準) なので整合する。
	const isDark = !mounted || resolvedTheme === "dark";
	const nextLabel = isDark
		? "ライトモードに切り替え"
		: "ダークモードに切り替え";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					aria-label={nextLabel}
					onClick={() => setTheme(isDark ? "light" : "dark")}
					size="icon"
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
