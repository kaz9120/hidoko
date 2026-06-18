import { ArrowLeft, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthButton } from "~/components/auth-button";
import { LogoMark } from "~/components/logo-mark";
import { Mark } from "~/components/mark";
import { ApiError, resetRequest } from "~/lib/auth-api";

export function meta() {
	return [
		{ title: "メールを送った｜パスワード再設定" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

const RESEND_COOLDOWN_SEC = 60;

/**
 * `?dev_reset_url=` は dev fallback で API から返ってきたものをそのまま付け回す
 * 仕様だが、検証なしで href に入れると `?dev_reset_url=https://evil` などで
 * 任意 URL を画面に出せてしまう。同一オリジン + `/reset/new?token=` 形式のみ採用する。
 */
function safeDevResetUrl(raw: string | null): string | null {
	if (!raw) return null;
	if (typeof window === "undefined") return null;
	try {
		const u = new URL(raw, window.location.origin);
		if (u.origin !== window.location.origin) return null;
		if (u.pathname !== "/reset/new") return null;
		if (!u.searchParams.get("token")) return null;
		return u.toString();
	} catch {
		return null;
	}
}

export default function ResetSentRoute() {
	const [params, setParams] = useSearchParams();
	const email = params.get("email") ?? "";
	const devResetUrl = safeDevResetUrl(params.get("dev_reset_url"));

	const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);
	const [resending, setResending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (cooldown <= 0) return;
		const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
		return () => window.clearTimeout(id);
	}, [cooldown]);

	async function onResend() {
		if (!email || resending || cooldown > 0) return;
		setError(null);
		setResending(true);
		try {
			const res = await resetRequest({ email });
			// dev fallback の URL は最新のものに差し替える。
			if (res.devResetUrl) {
				const next = new URLSearchParams(params);
				next.set("dev_reset_url", res.devResetUrl);
				setParams(next, { replace: true });
			}
			setCooldown(RESEND_COOLDOWN_SEC);
		} catch (err) {
			const message =
				err instanceof ApiError
					? err.message
					: "再送できなかった。時間をおいてやり直す";
			setError(message);
		} finally {
			setResending(false);
		}
	}

	return (
		<main className="relative grid min-h-dvh place-items-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
			<div className="absolute inset-x-6 top-6 flex items-center">
				<LogoMark size={22} title="アカウント" />
			</div>

			<div className="w-full max-w-[420px] text-center">
				<div
					className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-full border bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]"
					style={{
						borderColor: "color-mix(in oklab, var(--accent) 32%, transparent)",
					}}
				>
					<MailCheck aria-hidden className="size-6 text-[var(--accent)]" />
				</div>

				<Mark tone="ember">メール送信</Mark>
				<h1 className="mt-2 mb-3.5 font-medium text-[22px] text-[var(--text-strong)]">
					受信箱を開く
				</h1>
				<p className="mb-2 text-[13px] text-[var(--text-muted)] leading-[1.75]">
					{email ? (
						<>
							<span className="font-mono text-[12px] text-[var(--text)]">
								{email}
							</span>
							{" 宛に"}
						</>
					) : null}
					再設定リンクを送った。リンクの有効期限は 24 時間
				</p>

				<div className="mt-6 flex justify-center gap-2.5">
					<AuthButton
						size="sm"
						variant="ghost"
						onClick={onResend}
						disabled={resending || cooldown > 0 || !email}
					>
						{cooldown > 0 ? `再送（${cooldown}秒後）` : "再送する"}
					</AuthButton>
				</div>

				{error ? (
					<p className="mt-3 text-[12px] text-[var(--danger)]">{error}</p>
				) : null}

				{devResetUrl ? (
					// dev で Email Service の宛先未設定時、ここに再設定 URL を出してそのまま踏める。
					// prod では devResetUrl が返らないのでこのブロックは表示されない。
					<div className="mt-8 rounded-md border border-[var(--border)] bg-[var(--bg-overlay)] p-4 text-left">
						<Mark tone="ember">DEV ONLY</Mark>
						<p className="mt-2 mb-2 text-[12px] text-[var(--text-muted)]">
							sender 未設定のため再設定リンクをここに表示する
						</p>
						<a
							href={devResetUrl}
							className="break-all font-mono text-[11px] text-[var(--accent)] hover:text-[var(--accent-hover)]"
						>
							{devResetUrl}
						</a>
					</div>
				) : null}

				<div className="mt-8">
					<Link
						to="/signin"
						className="inline-flex items-center gap-1.5 font-medium text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)]"
					>
						<ArrowLeft aria-hidden className="size-3.5" />
						サインインに戻る
					</Link>
				</div>
			</div>
		</main>
	);
}
