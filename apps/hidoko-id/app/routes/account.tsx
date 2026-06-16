// /account 配下のレイアウトルート。左サイドナビ + コンテンツ（Outlet）の 2 column。
// 認証ガード: clientLoader で /api/me を叩き、未認証なら /signin?return_to=… に飛ばす。

import { LogOut } from "lucide-react";
import { useState } from "react";
import {
	Link,
	type LoaderFunctionArgs,
	Outlet,
	redirect,
	useLoaderData,
	useNavigate,
} from "react-router";
import { AccountNav } from "~/components/account-nav";
import { AuthButton } from "~/components/auth-button";
import { LogoMark } from "~/components/logo-mark";
import { Mark } from "~/components/mark";
import { fetchMe, type MeResponse, signout } from "~/lib/account-api";
import { ApiError } from "~/lib/auth-api";

export function meta() {
	return [
		{ title: "アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

interface LoaderData {
	user: MeResponse["user"];
}

export async function clientLoader({
	request,
}: LoaderFunctionArgs): Promise<LoaderData> {
	try {
		const me = await fetchMe();
		return { user: me.user };
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) {
			const here = new URL(request.url).pathname + new URL(request.url).search;
			throw redirect(`/signin?return_to=${encodeURIComponent(here)}`);
		}
		throw err;
	}
}

export default function AccountLayout() {
	const { user } = useLoaderData() as LoaderData;
	const navigate = useNavigate();
	const [signingOut, setSigningOut] = useState(false);

	async function onSignout() {
		setSigningOut(true);
		try {
			await signout();
		} catch {
			// サインアウト失敗時もとりあえず signin に戻す（cookie が残っていても
			// SPA のキャッシュは消えるので実害は小さい）。
		}
		navigate("/signin");
	}

	return (
		<main className="min-h-dvh bg-[var(--bg)] text-[var(--text)]">
			<header className="border-b border-[var(--border)] px-8 py-5">
				<div className="mx-auto flex max-w-[1080px] items-center justify-between">
					<Link to="/account" className="flex items-center gap-3">
						<LogoMark size={26} title="アカウント" />
						<span className="font-semibold text-[15px] text-[var(--text-strong)] tracking-[-0.02em]">
							アカウント
						</span>
					</Link>
					<div className="flex items-center gap-4 text-[13px]">
						<span className="font-mono text-[12px] text-[var(--text-faint)]">
							{user.email}
						</span>
						<AuthButton
							size="sm"
							variant="ghost"
							disabled={signingOut}
							onClick={onSignout}
						>
							<LogOut aria-hidden className="size-3.5" />
							{signingOut ? "サインアウト中…" : "サインアウト"}
						</AuthButton>
					</div>
				</div>
			</header>

			<div className="mx-auto grid max-w-[1080px] grid-cols-[220px_1fr] gap-10 px-8 py-10">
				<aside className="border-r border-[var(--border-subtle)] pr-6">
					<Mark className="mb-3 px-3 text-[10px]">設定</Mark>
					<AccountNav />
				</aside>
				<section className="min-w-0">
					<Outlet context={{ user } satisfies AccountContext} />
				</section>
			</div>
		</main>
	);
}

export interface AccountContext {
	user: MeResponse["user"];
}
