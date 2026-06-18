// /account/credentials — メール変更 + パスワード変更を 1 画面で。
// メール変更は新メール宛のリンクが踏まれるまで反映されないため、ここからは
// 「リンクを送った」までを扱う。実際の切り替えは Worker の /verify-email-change が
// 終わると /account?email_change=ok でレイアウトに通知が出る。

import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router";
import { AuthButton } from "~/components/auth-button";
import { AuthField, AuthInput } from "~/components/auth-input";
import { Mark } from "~/components/mark";
import { PasswordStrength } from "~/components/password-strength";
import { changePassword, requestEmailChange } from "~/lib/account-api";
import { ApiError } from "~/lib/auth-api";
import { checkPassword, passwordHint } from "~/lib/password";
import { scorePassword } from "~/lib/strength";
import type { AccountContext } from "./account";

export function meta() {
	return [
		{ title: "メール・パスワード｜アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

export default function AccountCredentialsRoute() {
	const { user } = useOutletContext<AccountContext>();
	const [searchParams] = useSearchParams();

	// パスワード変更
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [pwSubmitting, setPwSubmitting] = useState(false);
	const [pwError, setPwError] = useState<string | null>(null);
	const [pwDone, setPwDone] = useState(false);

	const pwCheck = useMemo(() => checkPassword(newPassword), [newPassword]);
	const pwScore = useMemo(() => scorePassword(newPassword), [newPassword]);
	const pwMismatch =
		confirmPassword.length > 0 && confirmPassword !== newPassword;

	const canSubmitPw =
		!pwSubmitting &&
		pwCheck.ok &&
		newPassword === confirmPassword &&
		(searchParams.get("set_password") === "1" || currentPassword.length > 0);

	async function onSubmitPassword(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setPwSubmitting(true);
		setPwError(null);
		setPwDone(false);
		try {
			await changePassword({
				currentPassword: currentPassword || undefined,
				newPassword,
			});
			setPwDone(true);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			const msg =
				err instanceof ApiError ? err.message : "パスワードを変更できなかった";
			setPwError(msg);
		} finally {
			setPwSubmitting(false);
		}
	}

	// メール変更
	const [newEmail, setNewEmail] = useState("");
	const [emailSubmitting, setEmailSubmitting] = useState(false);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
	const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);

	async function onSubmitEmail(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setEmailSubmitting(true);
		setEmailError(null);
		try {
			const res = await requestEmailChange({ newEmail });
			setEmailSentTo(res.newEmail);
			setDevVerifyUrl(res.devVerifyUrl ?? null);
			setNewEmail("");
		} catch (err) {
			const msg =
				err instanceof ApiError ? err.message : "メールを送れなかった";
			setEmailError(msg);
		} finally {
			setEmailSubmitting(false);
		}
	}

	const pwHelp = newPassword
		? pwCheck.ok
			? null
			: passwordHint(pwCheck)
		: "英数字を含む 12 文字以上";

	return (
		<div className="flex flex-col gap-10">
			<section className="flex flex-col gap-5">
				<header>
					<Mark tone="ember">メール</Mark>
					<h1 className="mt-2 mb-1 font-medium text-[22px] text-[var(--text-strong)] tracking-[-0.01em]">
						メールアドレスを変える
					</h1>
					<p className="m-0 text-[13px] text-[var(--text-muted)] leading-[1.7]">
						新しいメールアドレス宛に確認リンクを送る。リンクが踏まれるまで現在の
						<span className="ml-1 font-mono text-[12px]">{user.email}</span>{" "}
						のまま
					</p>
				</header>

				{emailSentTo ? (
					<div
						className="rounded-md border bg-[color-mix(in_oklab,var(--success)_14%,transparent)] px-3.5 py-3 text-[13px] text-[#b9c79a]"
						style={{
							borderColor:
								"color-mix(in oklab, var(--success) 35%, transparent)",
						}}
					>
						<span className="inline-flex items-center gap-2">
							<Mail aria-hidden className="size-3.5" />
							<span>
								<span className="font-mono">{emailSentTo}</span>{" "}
								に確認リンクを送った
							</span>
						</span>
						{devVerifyUrl ? (
							<a
								href={devVerifyUrl}
								className="mt-2 block break-all font-mono text-[11px] text-[var(--accent)] hover:text-[var(--accent-hover)]"
							>
								DEV ONLY: {devVerifyUrl}
							</a>
						) : null}
					</div>
				) : null}

				<form
					onSubmit={onSubmitEmail}
					className="flex max-w-[480px] flex-col gap-4"
				>
					<AuthField
						label="新しいメール"
						htmlFor="email-new"
						error={emailError}
					>
						<AuthInput
							id="email-new"
							type="email"
							autoComplete="off"
							required
							placeholder="name@example.com"
							hasError={Boolean(emailError)}
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
						/>
					</AuthField>
					<AuthButton
						type="submit"
						variant="primary"
						size="md"
						disabled={emailSubmitting || !newEmail.includes("@")}
					>
						{emailSubmitting ? "送信中…" : "確認リンクを送る"}
						<ArrowRight aria-hidden className="size-4" />
					</AuthButton>
				</form>
			</section>

			<div className="h-px bg-[var(--border-subtle)]" />

			<section className="flex flex-col gap-5">
				<header>
					<Mark tone="ember">パスワード</Mark>
					<h1 className="mt-2 mb-1 font-medium text-[22px] text-[var(--text-strong)] tracking-[-0.01em]">
						パスワードを変える
					</h1>
					<p className="m-0 text-[13px] text-[var(--text-muted)] leading-[1.7]">
						変更すると、他端末からはサインアウトされる
					</p>
				</header>

				{pwDone ? (
					<div
						className="rounded-md border bg-[color-mix(in_oklab,var(--success)_14%,transparent)] px-3.5 py-3 text-[13px] text-[#b9c79a]"
						style={{
							borderColor:
								"color-mix(in oklab, var(--success) 35%, transparent)",
						}}
					>
						<span className="inline-flex items-center gap-2">
							<ShieldCheck aria-hidden className="size-3.5" />
							パスワードを更新し、他端末からはサインアウトした
						</span>
					</div>
				) : null}

				<form
					onSubmit={onSubmitPassword}
					className="flex max-w-[480px] flex-col gap-4"
				>
					<AuthField label="現在のパスワード" htmlFor="pw-current">
						<AuthInput
							id="pw-current"
							type="password"
							autoComplete="current-password"
							placeholder="現在のパスワード"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
						/>
					</AuthField>
					<AuthField label="新しいパスワード" htmlFor="pw-new" hint={pwHelp}>
						<AuthInput
							id="pw-new"
							type="password"
							autoComplete="new-password"
							required
							minLength={12}
							placeholder="12 文字以上"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
					</AuthField>
					{newPassword ? <PasswordStrength score={pwScore} /> : null}
					<AuthField
						label="もう一度入力"
						htmlFor="pw-confirm"
						error={
							pwMismatch ? "入力したパスワードと一致しない" : (pwError ?? null)
						}
					>
						<AuthInput
							id="pw-confirm"
							type="password"
							autoComplete="new-password"
							required
							minLength={12}
							placeholder="同じパスワードをもう一度"
							hasError={pwMismatch || Boolean(pwError)}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</AuthField>
					<AuthButton
						type="submit"
						variant="primary"
						size="md"
						disabled={!canSubmitPw}
					>
						{pwSubmitting ? "更新中…" : "パスワードを更新"}
						<ArrowRight aria-hidden className="size-4" />
					</AuthButton>
				</form>
			</section>
		</div>
	);
}
