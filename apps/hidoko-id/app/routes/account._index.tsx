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
					<h1 className="mt-2 mb-1 font-medium text-[22px] text-fg-strong tracking-[-0.01em]">
						あなたのアカウント
					</h1>
					<p className="m-0 text-[13px] text-fg-muted leading-[1.7]">
						表示名・アバターは編集できる
					</p>
				</div>
				<Link
					to="/account/profile"
					className="inline-flex items-center gap-1 self-center font-medium text-[13px] text-brand hover:text-brand-hover"
				>
					編集
					<ArrowUpRight aria-hidden className="size-3.5" />
				</Link>
			</header>

			<dl className="grid grid-cols-[140px_1fr] gap-x-6 gap-y-3 text-[14px]">
				<dt className="flex items-center gap-2 text-fg-muted">
					<User aria-hidden className="size-3.5" /> 表示名
				</dt>
				<dd className="m-0 text-fg-strong">
					{user.displayName ?? <span className="text-fg-subtle">未設定</span>}
				</dd>

				<dt className="flex items-center gap-2 text-fg-muted">
					<Mail aria-hidden className="size-3.5" /> メール
				</dt>
				<dd className="m-0 flex items-center gap-2 font-mono text-fg-strong">
					{user.email}
					{user.emailVerified ? (
						<span
							className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-sans text-[11px] text-success"
							style={{
								borderColor:
									"color-mix(in oklab, var(--color-success) 35%, transparent)",
								backgroundColor:
									"color-mix(in oklab, var(--color-success) 14%, transparent)",
							}}
						>
							<CheckCircle aria-hidden className="size-3" /> 確認済み
						</span>
					) : (
						<span className="inline-flex rounded-full border border-danger/40 bg-danger/14 px-2 py-0.5 font-sans text-[11px] text-danger">
							未確認
						</span>
					)}
				</dd>
			</dl>
		</div>
	);
}
