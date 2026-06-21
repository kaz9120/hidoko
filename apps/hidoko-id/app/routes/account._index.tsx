// /account のデフォルト画面（プロフィール）。phase 1 は読み取りのみ。
// 表示名・アバターの編集は phase 2 で /account/profile に切り出す前提。

import { ArrowUpRight, CheckCircle, Mail, User } from "lucide-react";
import { Link, useOutletContext } from "react-router";
import { Mark } from "~/components/mark";
import type { AccountContext } from "./account";

export function meta() {
	return [
		{ title: "プロフィール｜アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

export default function AccountProfileRoute() {
	const { user } = useOutletContext<AccountContext>();

	return (
		<div className="flex flex-col gap-7">
			<header className="flex items-start justify-between gap-4">
				<div>
					<Mark tone="ember">プロフィール</Mark>
					<h1 className="mt-2 mb-1 font-medium text-[22px] text-[var(--text-strong)] tracking-[-0.01em]">
						あなたのアカウント
					</h1>
					<p className="m-0 text-[13px] text-[var(--text-muted)] leading-[1.7]">
						表示名・アバターは編集できる
					</p>
				</div>
				<Link
					to="/account/profile"
					className="inline-flex items-center gap-1 self-center font-medium text-[13px] text-[var(--brand)] hover:text-[var(--brand-hover)]"
				>
					編集
					<ArrowUpRight aria-hidden className="size-3.5" />
				</Link>
			</header>

			<dl className="grid grid-cols-[140px_1fr] gap-x-6 gap-y-3 text-[14px]">
				<dt className="flex items-center gap-2 text-[var(--text-muted)]">
					<User aria-hidden className="size-3.5" /> 表示名
				</dt>
				<dd className="m-0 text-[var(--text-strong)]">
					{user.displayName ?? (
						<span className="text-[var(--text-faint)]">未設定</span>
					)}
				</dd>

				<dt className="flex items-center gap-2 text-[var(--text-muted)]">
					<Mail aria-hidden className="size-3.5" /> メール
				</dt>
				<dd className="m-0 flex items-center gap-2 font-mono text-[var(--text-strong)]">
					{user.email}
					{user.emailVerified ? (
						<span
							className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-sans text-[11px] text-[#b9c79a]"
							style={{
								borderColor:
									"color-mix(in oklab, var(--success) 35%, transparent)",
								backgroundColor:
									"color-mix(in oklab, var(--success) 14%, transparent)",
							}}
						>
							<CheckCircle aria-hidden className="size-3" /> 確認済み
						</span>
					) : (
						<span className="inline-flex rounded-full border border-[var(--danger)]/40 bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] px-2 py-0.5 font-sans text-[11px] text-[var(--danger)]">
							未確認
						</span>
					)}
				</dd>
			</dl>
		</div>
	);
}
