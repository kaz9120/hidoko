import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import logoCreamUrl from "ui/assets/logo/mark-cream.svg?url";
import logoDarkUrl from "ui/assets/logo/mark-dark.svg?url";
import { ThemeToggle } from "../theme-toggle";

/**
 * 画面最上段のヘッダ。左はロゴ・アプリ名・バッジ、右は ThemeToggle と、
 * プロフィール設定が済んでいる場合はそのチップ（ブランド表記 + 名前）。
 *
 * `profile` を渡さない呼び出し（プロフィール未確定・Storybook 等）では
 * チップ自体を出さない。
 */
export function SiteHeader({
	profile,
	onProfileClick,
}: {
	profile?: { brand: string; author: string } | null;
	onProfileClick?: () => void;
}) {
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
			<div className="ml-auto flex items-center gap-1.5">
				{profile && onProfileClick && (
					<button
						type="button"
						onClick={onProfileClick}
						className="flex h-7 max-w-[220px] items-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
						aria-label="プロフィールを編集"
					>
						<span className="truncate text-foreground/80">
							{profile.brand || "プロフィール"}
						</span>
						{profile.author && (
							<span className="hidden truncate text-(--text-faint) sm:inline">
								· {profile.author}
							</span>
						)}
					</button>
				)}
				<ThemeToggle />
			</div>
		</header>
	);
}
