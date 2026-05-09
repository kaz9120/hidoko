import { cva } from "class-variance-authority";
import {
	BriefcaseIcon,
	CrownIcon,
	Gamepad2Icon,
	HeartIcon,
	type LucideIcon,
	MegaphoneIcon,
	PlaneIcon,
	PuzzleIcon,
	TentIcon,
	TrophyIcon,
	UsersIcon,
} from "lucide-react";

import { type BioIconName, type BioKind, PROFILE } from "~/data/profile";

const ICONS: Record<BioIconName, LucideIcon> = {
	briefcase: BriefcaseIcon,
	megaphone: MegaphoneIcon,
	users: UsersIcon,
	trophy: TrophyIcon,
	crown: CrownIcon,
	tent: TentIcon,
	"gamepad-2": Gamepad2Icon,
	plane: PlaneIcon,
	puzzle: PuzzleIcon,
	heart: HeartIcon,
};

const GROUPS: { kind: BioKind; label: string }[] = [
	{ kind: "role", label: "仕事" },
	{ kind: "comm", label: "コミュニティ" },
	{ kind: "fact", label: "経歴" },
	{ kind: "hobby", label: "好きなもの" },
];

const chip = cva(
	"inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[13.5px] text-foreground transition-all duration-200 hover:border-border-strong hover:bg-secondary [&_svg]:size-3.5 [&_svg]:text-muted-foreground",
	{
		variants: {
			kind: {
				role: "border-[color-mix(in_oklab,var(--ember-400)_22%,var(--border))] bg-[color-mix(in_oklab,var(--ember-400)_8%,var(--bg-raised))] [&_svg]:text-primary",
				comm: "bg-card [&_svg]:text-ember-300",
				fact: "bg-[var(--bg-sunken)] font-mono text-[12.5px] [&_svg]:text-moon",
				hobby: "px-[11px] py-1.5 text-[13px] text-muted-foreground bg-card",
			},
		},
		defaultVariants: { kind: "role" },
	},
);

export function Bio() {
	return (
		<div className="flex flex-col gap-[22px]">
			{GROUPS.map((group) => {
				const items = PROFILE.bioParts.filter((p) => p.kind === group.kind);
				if (items.length === 0) return null;
				return (
					<div
						key={group.kind}
						// 末尾の罫線だけ消すために :not(:last-child) で対応
						className="grid grid-cols-1 items-baseline gap-3 border-b border-border-subtle pb-[18px] last-of-type:border-b-0 min-[880px]:grid-cols-[110px_1fr] min-[880px]:gap-6"
					>
						<div className="pt-1.5 text-[13px] text-text-faint">
							{group.label}
						</div>
						<div className="flex flex-wrap gap-2">
							{items.map((part) => {
								const Icon = ICONS[part.icon];
								return (
									<span key={part.text} className={chip({ kind: part.kind })}>
										<Icon aria-hidden="true" />
										<span>{part.text}</span>
										{part.tag && (
											<span className="rounded-sm bg-[color-mix(in_oklab,var(--ember-400)_12%,transparent)] px-1.5 py-0.5 font-mono text-[10.5px] text-primary">
												{part.tag}
											</span>
										)}
									</span>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
