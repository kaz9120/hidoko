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
 * 夜と昼を切り替えるボタン。押すと反対のテーマにし、選んだ値を localStorage の
 * `takibi-theme` に残す。
 *
 * Takibi の ThemeToggle は自分の onClick を外から渡した props で上書きするので、
 * Tooltip のトリガーに重ねると押しても切り替わらない。同じ useThemePreference を
 * 使ってボタンだけ自前で組む。
 */
export function ThemeToggle() {
	const { theme, setPreference } = useThemePreference();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// prerender の HTML は夜で描かれている。hydration が終わるまでは夜として描き、差分を出さない
	const isDark = !mounted || theme === "dark";
	const label = isDark ? "昼にする" : "夜にする";

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						aria-label={label}
						data-theme-value={theme}
						onClick={() => setPreference(isDark ? "light" : "dark")}
						size="icon"
						variant="ghost"
					/>
				}
			>
				{isDark ? (
					<MoonIcon strokeWidth={1.75} />
				) : (
					<SunIcon strokeWidth={1.75} />
				)}
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}
