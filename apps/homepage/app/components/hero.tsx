import { ArrowDownIcon } from "lucide-react";

import { PROFILE } from "~/data/profile";
import { useEmbers } from "~/lib/use-embers";

export function Hero() {
	useEmbers();

	return (
		<header className="ykz-hero-glow relative flex min-h-[92vh] items-center overflow-hidden px-[var(--ykz-pad)] pt-[140px] pb-[88px]">
			<hi-embers className="ykz-embers" density={36} wind="0.04" />
			<div className="relative z-[2] mx-auto w-full max-w-[1080px]">
				<div className="mb-6 font-mono text-[11px] tracking-[0.32em] text-primary">
					{PROFILE.nameRoman.toUpperCase()}
				</div>
				<h1 className="m-0 mb-[18px] flex flex-col gap-1.5 font-semibold leading-[1.05] tracking-[-0.025em] text-text-strong">
					<span className="text-[clamp(48px,7vw,84px)]">{PROFILE.name}</span>
					<span className="text-[clamp(40px,6vw,72px)] font-medium leading-[1.1] tracking-[-0.022em] text-primary">
						{PROFILE.catch}
					</span>
				</h1>
				<p className="m-0 mb-[22px] text-[15px] tracking-[0.005em] text-muted-foreground">
					{PROFILE.org}
				</p>
				<p className="m-0 mb-10 max-w-[460px] text-base leading-[1.85] text-foreground">
					登壇資料・記事・自作ツールを、ここに置いています。
				</p>
				<div className="flex items-center gap-[22px]">
					<a
						href="#about"
						className="inline-flex items-center gap-1 border-b border-transparent pb-px font-medium text-primary transition-all duration-200 hover:border-accent-hover hover:text-accent-hover"
					>
						自己紹介
						<ArrowDownIcon className="size-3.5" aria-hidden="true" />
					</a>
				</div>
			</div>
		</header>
	);
}
