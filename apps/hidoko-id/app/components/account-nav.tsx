// /account 配下の左サイドナビ。design v2 の構成（プロフィール / メール・パスワード /
// 接続済みアプリ / 接続済み MCP / セッション / 危険な操作）を見せて、未実装のものは
// disabled で並べる。

import { NavLink } from "react-router";
import { cn } from "takibi-design-system";

interface NavItem {
	label: string;
	to?: string;
	soon?: string;
}

const NAV: readonly NavItem[] = [
	{ label: "プロフィール", to: "/account" },
	{ label: "メール・パスワード", to: "/account/credentials" },
	{ label: "接続済みアプリ", soon: "OAuth プロバイダ実装後" },
	{ label: "接続済み MCP", soon: "OAuth プロバイダ実装後" },
	{ label: "セッション", to: "/account/sessions" },
	{ label: "危険な操作", to: "/account/danger" },
];

export function AccountNav() {
	return (
		<nav aria-label="アカウント設定" className="flex flex-col gap-0.5">
			{NAV.map((item) => {
				if (!item.to) {
					return (
						<span
							key={item.label}
							title={item.soon}
							className="cursor-not-allowed rounded-md px-3 py-2 text-[13px] text-fg-subtle"
						>
							{item.label}
							<span className="ml-2 font-mono text-[10px] tracking-[0.1em] text-fg-subtle">
								soon
							</span>
						</span>
					);
				}
				return (
					<NavLink
						key={item.label}
						to={item.to}
						end={item.to === "/account"}
						className={({ isActive }) =>
							cn(
								"rounded-md px-3 py-2 text-[13px] transition-colors",
								isActive
									? "bg-surface-overlay font-medium text-fg-strong"
									: "text-fg-muted hover:bg-surface-overlay hover:text-fg-strong",
							)
						}
					>
						{item.label}
					</NavLink>
				);
			})}
		</nav>
	);
}
