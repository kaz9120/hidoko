import { ArrowUpRightIcon, XIcon } from "lucide-react";

import { buttonVariants, cn } from "takibi-design-system";
import { HidokoMark } from "~/components/hidoko-mark";
import { PROFILE, X_HANDLE, X_PROFILE_URL } from "~/data/profile";

export function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="border-t border-line-subtle bg-surface px-[var(--ykz-pad)] pt-14 pb-12">
			<div className="mx-auto grid max-w-[1080px] grid-cols-1 items-start gap-10 min-[880px]:grid-cols-[auto_1fr]">
				<div className="flex items-center gap-3">
					<HidokoMark size={20} />
					<div>
						<div className="font-mono text-[14.5px] font-medium text-fg-strong">
							y-kaz.com
						</div>
						<div className="mt-0.5 text-xs text-fg-subtle">
							{PROFILE.name} / {PROFILE.nameRoman}
						</div>
					</div>
				</div>
				<a
					href={X_PROFILE_URL}
					target="_blank"
					rel="noreferrer"
					className={cn(
						buttonVariants({ variant: "secondary" }),
						"self-center motion-press hover:text-brand min-[880px]:justify-self-end",
					)}
				>
					<XIcon aria-hidden="true" />
					<span>{X_HANDLE}</span>
					<ArrowUpRightIcon aria-hidden="true" />
				</a>
				<div className="col-span-full mt-7 border-t border-line-subtle pt-5 font-mono text-[11px] tracking-[0.06em] text-fg-subtle">
					© {year} {PROFILE.name}
				</div>
			</div>
		</footer>
	);
}
