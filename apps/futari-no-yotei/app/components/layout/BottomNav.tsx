import { Calendar, House, Settings } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { NavLink } from "react-router";

type Tab = {
	id: "home" | "cal" | "gear";
	label: string;
	to: string;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
	/** NavLink の end. `/` は完全一致のみ active にする */
	end?: boolean;
};

const TABS: Tab[] = [
	{ id: "home", label: "ホーム", to: "/", Icon: House, end: true },
	{ id: "cal", label: "カレンダー", to: "/week", Icon: Calendar },
	{
		id: "gear",
		label: "設定",
		to: "/settings/status-items",
		Icon: Settings,
		end: false,
	},
];

/**
 * 画面下の 3 タブ。アクティブタブは accent 色 + 上端の小さなインジケータで
 * 視覚的にも `aria-current` の両方で示す。
 *
 * NOTE: 「カレンダー」タブの遷移先 (`/week`) は後続 PR で実装する。
 * 現状クリックすると 404 にフォールバックするので、画面追加と同時にここを
 * 拡張せずとも自然につながる。
 */
export function BottomNav() {
	return (
		<nav
			aria-label="アプリ内ナビゲーション"
			className="sticky bottom-0 flex justify-around border-border-subtle border-t bg-bg-raised px-0 pt-2 pb-2.5"
		>
			{TABS.map(({ id, label, to, Icon, end }) => (
				<NavLink
					key={id}
					to={to}
					end={end}
					className="relative flex flex-1 flex-col items-center gap-0.5 px-0 py-1 font-medium text-[10px] text-text-faint no-underline aria-[current=page]:text-brand"
				>
					{({ isActive }) => (
						<>
							{isActive ? (
								<span
									aria-hidden
									className="-top-2 absolute h-0.5 w-6 rounded-full bg-brand shadow-[0_0_18px_color-mix(in_oklab,var(--brand)_35%,transparent)]"
								/>
							) : null}
							<Icon width={22} height={22} strokeWidth={1.75} aria-hidden />
							<span>{label}</span>
						</>
					)}
				</NavLink>
			))}
		</nav>
	);
}
