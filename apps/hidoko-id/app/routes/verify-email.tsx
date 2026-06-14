import { ArrowLeft, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthButton } from "~/components/auth-button";
import { LogoMark } from "~/components/logo-mark";
import { Mark } from "~/components/mark";

export function meta() {
	return [
		{ title: "メールを確認｜アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

// MX ベースで受信箱への直リンクを推測する。Gmail / iCloud / Outlook のみ対応。
function inboxUrl(email: string): string | null {
	const at = email.lastIndexOf("@");
	if (at < 0) return null;
	const domain = email.slice(at + 1).toLowerCase();
	if (domain === "gmail.com" || domain === "googlemail.com")
		return "https://mail.google.com/";
	if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com")
		return "https://www.icloud.com/mail";
	if (
		domain === "outlook.com" ||
		domain === "hotmail.com" ||
		domain === "live.com"
	)
		return "https://outlook.live.com/mail/";
	return null;
}

export default function VerifyEmailRoute() {
	const [params] = useSearchParams();
	const email = params.get("email") ?? "";
	const devVerifyUrl = params.get("dev_verify_url");

	const [resendCooldown, setResendCooldown] = useState(30);
	useEffect(() => {
		if (resendCooldown <= 0) return;
		const id = window.setTimeout(() => setResendCooldown((s) => s - 1), 1000);
		return () => window.clearTimeout(id);
	}, [resendCooldown]);

	const inbox = inboxUrl(email);

	return (
		<main className="relative grid min-h-dvh place-items-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
			<div className="absolute inset-x-6 top-6 flex items-center">
				<LogoMark size={22} title="アカウント" />
			</div>

			<div className="w-full max-w-[420px] text-center">
				<div
					className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-full border bg-[color-mix(in_oklab,var(--ember-400)_14%,transparent)]"
					style={{
						borderColor:
							"color-mix(in oklab, var(--ember-400) 32%, transparent)",
					}}
				>
					<MailCheck aria-hidden className="size-6 text-[var(--ember-400)]" />
				</div>

				<Mark tone="ember">メール確認</Mark>
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
					確認リンクを送った。リンクを開くと、サインアップが完了する
				</p>

				<div className="mt-6 flex justify-center gap-2.5">
					{inbox ? (
						<AuthButton
							size="sm"
							onClick={() => {
								window.open(inbox, "_blank", "noopener");
							}}
						>
							受信箱を開く
						</AuthButton>
					) : null}
					<AuthButton size="sm" variant="ghost" disabled={resendCooldown > 0}>
						{resendCooldown > 0 ? `再送（${resendCooldown}秒後）` : "再送する"}
					</AuthButton>
				</div>

				<p className="mt-6 font-mono text-[11px] tracking-[0.1em] text-[var(--text-faint)]">
					違うメールで作成{" "}
					<Link
						to="/signup"
						className="text-[var(--ember-400)] hover:text-[var(--ember-300)]"
					>
						→
					</Link>
				</p>

				{devVerifyUrl ? (
					// dev で Email Service の宛先が未設定のとき、ここに検証 URL を出してそのまま踏める。
					// prod では /api/signup 側で発行されないため、このブロックは表示されない。
					<div className="mt-8 rounded-md border border-[var(--border)] bg-[var(--bg-overlay)] p-4 text-left">
						<Mark tone="ember">DEV ONLY</Mark>
						<p className="mt-2 mb-2 text-[12px] text-[var(--text-muted)]">
							sender 未設定のため検証リンクをここに表示する
						</p>
						<a
							href={devVerifyUrl}
							className="break-all font-mono text-[11px] text-[var(--ember-400)] hover:text-[var(--ember-300)]"
						>
							{devVerifyUrl}
						</a>
					</div>
				) : null}

				<div className="mt-8">
					<Link
						to="/signin"
						className="inline-flex items-center gap-1.5 font-medium text-[13px] text-[var(--ember-400)] hover:text-[var(--ember-300)]"
					>
						<ArrowLeft aria-hidden className="size-3.5" />
						サインインに戻る
					</Link>
				</div>
			</div>
		</main>
	);
}
