import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import logoCreamUrl from "ui/assets/logo/mark-cream.svg?url";
import logoDarkUrl from "ui/assets/logo/mark-dark.svg?url";
import { ThemeToggle } from "../theme-toggle";

export function SiteHeader() {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// hydration 前は dark 想定で描画してチラつきを抑える。tokens.css は
	// dark が初期状態 (`:root` がダーク基準) なので整合する。
	const logoUrl =
		mounted && resolvedTheme === "light" ? logoCreamUrl : logoDarkUrl;

	return (
		<header className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:px-5">
			<div className="flex items-center gap-2.5">
				<img alt="" aria-hidden="true" className="size-5" src={logoUrl} />
				<h1 className="text-sm font-semibold tracking-tight text-foreground">
					アイキャッチ台紙
				</h1>
				<span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
					note OGP
				</span>
			</div>
			<div className="ml-auto flex items-center gap-1">
				<ThemeToggle />
			</div>
		</header>
	);
}
