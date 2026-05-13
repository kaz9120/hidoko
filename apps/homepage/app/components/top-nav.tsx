import { SendIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, cn } from "ui";
import { HidokoMark } from "~/components/hidoko-mark";
import { X_PROFILE_URL } from "~/data/profile";

const NAV_ITEMS = [
	{ href: "#about", label: "About" },
	{ href: "#picks", label: "Notes" },
	{ href: "#decks", label: "Decks" },
	{ href: "#media", label: "Media" },
	{ href: "#tools", label: "Tools" },
] as const;

export function TopNav() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<nav
			className={cn(
				"fixed inset-x-0 top-0 z-50 flex items-center gap-8 px-[var(--ykz-pad)] py-3.5 transition-all duration-200",
				// 一定スクロール後だけ半透明 + ぼかしで地のヒーローと分離する
				scrolled &&
					"border-b border-border-subtle bg-[color-mix(in_oklab,var(--bg-0)_82%,transparent)] [backdrop-filter:blur(14px)_saturate(140%)]",
			)}
		>
			<a
				className="inline-flex items-center gap-2.5 text-[14.5px] font-medium text-text-strong"
				href="#top"
			>
				<HidokoMark size={26} />
				<span className="font-mono tracking-[-0.005em] text-foreground">
					y-kaz.com
				</span>
			</a>
			<div className="hidden gap-[26px] min-[880px]:flex">
				{NAV_ITEMS.map((item) => (
					<a
						key={item.href}
						href={item.href}
						className="text-[13.5px] text-muted-foreground transition-colors hover:text-text-strong"
					>
						{item.label}
					</a>
				))}
			</div>
			<Button
				asChild
				variant="outline"
				size="sm"
				// shadcn outline の hover (bg-accent) を打ち消し、文字とボーダーだけアクセント化する
				className="ml-auto bg-secondary hover:border-[color-mix(in_oklab,var(--accent)_50%,var(--border))] hover:bg-secondary hover:text-primary"
			>
				<a href={X_PROFILE_URL} target="_blank" rel="noreferrer">
					<SendIcon aria-hidden="true" />
					<span>X DM</span>
				</a>
			</Button>
		</nav>
	);
}
