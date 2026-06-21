import { ArrowUpRightIcon, XIcon } from "lucide-react";

import { Button } from "ui";
import { HidokoMark } from "~/components/hidoko-mark";
import { PROFILE, X_HANDLE, X_PROFILE_URL } from "~/data/profile";

export function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="border-t border-border-subtle bg-bg-0 px-[var(--ykz-pad)] pt-14 pb-12">
			<div className="mx-auto grid max-w-[1080px] grid-cols-1 items-start gap-10 min-[880px]:grid-cols-[auto_1fr]">
				<div className="flex items-center gap-3">
					<HidokoMark size={20} />
					<div>
						<div className="font-mono text-[14.5px] font-medium text-text-strong">
							y-kaz.com
						</div>
						<div className="mt-0.5 text-xs text-text-faint">
							{PROFILE.name} / {PROFILE.nameRoman}
						</div>
					</div>
				</div>
				<Button
					asChild
					variant="outline"
					className="self-center bg-bg-overlay hover:border-[color-mix(in_oklab,var(--accent)_50%,var(--border))] hover:bg-bg-overlay hover:text-accent min-[880px]:justify-self-end"
				>
					<a href={X_PROFILE_URL} target="_blank" rel="noreferrer">
						<XIcon aria-hidden="true" />
						<span>{X_HANDLE}</span>
						<ArrowUpRightIcon aria-hidden="true" />
					</a>
				</Button>
				<div className="col-span-full mt-7 border-t border-border-subtle pt-5 font-mono text-[11px] tracking-[0.06em] text-text-faint">
					© {year} {PROFILE.name}
				</div>
			</div>
		</footer>
	);
}
