import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
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
