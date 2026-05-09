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

export function Bio() {
	return (
		<div className="ykz-bio ykz-bio--chips">
			{GROUPS.map((group) => {
				const items = PROFILE.bioParts.filter((p) => p.kind === group.kind);
				if (items.length === 0) return null;
				return (
					<div key={group.kind} className="ykz-bio__group">
						<div className="ykz-bio__group-label">{group.label}</div>
						<div className="ykz-bio__group-items">
							{items.map((part) => {
								const Icon = ICONS[part.icon];
								return (
									<span
										key={part.text}
										className={`ykz-chip ykz-chip--${part.kind}`}
									>
										<Icon className="hi-icon-sm" aria-hidden="true" />
										<span>{part.text}</span>
										{part.tag && (
											<span className="ykz-chip__tag hi-mono">{part.tag}</span>
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
