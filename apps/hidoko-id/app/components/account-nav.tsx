// /account 配下の左サイドナビ。design v2 の構成（プロフィール / メール・パスワード /
// 接続済みアプリ / 接続済み MCP / セッション / 危険な操作）を見せて、未実装のものは
// disabled で並べる。

import { NavLink } from "react-router";
import { cn } from "ui/lib/utils";

interface NavItem {
	label: string;
	to?: string;
	soon?: string;
}

const NAV: readonly NavItem[] = [
	{ label: "プロフィール", to: "/account" },
	{ label: "メール・パスワード", soon: "次のフェーズで対応" },
	{ label: "接続済みアプリ", soon: "OAuth プロバイダ実装後" },
	{ label: "接続済み MCP", soon: "OAuth プロバイダ実装後" },
	{ label: "セッション", to: "/account/sessions" },
	{ label: "危険な操作", soon: "次のフェーズで対応" },
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
							className="cursor-not-allowed rounded-md px-3 py-2 text-[13px] text-[var(--text-faint)]"
						>
							{item.label}
							<span className="ml-2 font-mono text-[10px] tracking-[0.1em] text-[var(--text-faint)]">
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
									? "bg-[var(--bg-overlay)] font-medium text-[var(--text-strong)]"
									: "text-[var(--text-muted)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-strong)]",
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
