import { ArrowRight, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AuthButton } from "~/components/auth-button";
import { AuthField, AuthInput } from "~/components/auth-input";
import { LogoMark } from "~/components/logo-mark";
import { Mark } from "~/components/mark";
import { PasswordStrength } from "~/components/password-strength";
import { ApiError, resetConfirm } from "~/lib/auth-api";
import { checkPassword, passwordHint } from "~/lib/password";
import { scorePassword } from "~/lib/strength";

export function meta() {
	return [
		{ title: "新しいパスワード｜パスワード再設定" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

export default function ResetNewRoute() {
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const token = params.get("token") ?? "";

	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [expired, setExpired] = useState(false);

	const passwordCheck = useMemo(() => checkPassword(password), [password]);
	const strength = useMemo(() => scorePassword(password), [password]);
	const confirmMismatch = confirm.length > 0 && confirm !== password;
	const canSubmit =
		!submitting &&
		Boolean(token) &&
		passwordCheck.ok &&
		password === confirm &&
		!expired;

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			await resetConfirm({ token, password });
			navigate("/reset/done");
		} catch (err) {
			if (err instanceof ApiError && err.code === "token_expired") {
				setExpired(true);
			} else {
				const message =
					err instanceof ApiError
						? err.message
						: "更新できなかった。時間をおいてやり直す";
				setError(message);
			}
			setSubmitting(false);
		}
	}

	if (!token || expired) {
		return (
			<main className="relative grid min-h-dvh place-items-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
				<div className="absolute inset-x-6 top-6 flex items-center">
					<LogoMark size={22} title="アカウント" />
				</div>

				<div className="w-full max-w-[400px] text-center">
					<div
						className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-full border bg-[color-mix(in_oklab,var(--danger)_14%,transparent)]"
						style={{
							borderColor:
								"color-mix(in oklab, var(--danger) 32%, transparent)",
						}}
					>
						<RotateCcw aria-hidden className="size-6 text-[var(--danger)]" />
					</div>

					<Mark tone="muted">リンクの有効期限</Mark>
					<h1 className="mt-2 mb-3 font-medium text-[22px] text-[var(--text-strong)]">
						このリンクは使えない
					</h1>
					<p className="mb-6 text-[13px] text-[var(--text-muted)] leading-[1.75]">
						リンクの有効期限が切れたか、すでに使われた。
						<br />
						最初からやり直す
					</p>

					<AuthButton
						type="button"
						variant="primary"
						size="lg"
						onClick={() => navigate("/reset")}
					>
						もう一度リンクを送る
						<ArrowRight aria-hidden className="size-4" />
					</AuthButton>
				</div>
			</main>
		);
	}

	const passwordHelp = password
		? passwordCheck.ok
			? null
			: passwordHint(passwordCheck)
		: "英数字を含む 12 文字以上。記号は任意";

	return (
		<main className="relative grid min-h-dvh place-items-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
			<div className="absolute inset-x-6 top-6 flex items-center">
				<LogoMark size={22} title="アカウント" />
			</div>

			<div className="w-full max-w-[400px]">
				<div className="mb-7">
					<Mark tone="ember">新しいパスワード</Mark>
					<h1 className="mt-2 mb-2 font-medium text-[24px] text-[var(--text-strong)] tracking-[-0.01em]">
						パスワードを更新する
					</h1>
					<p className="m-0 text-[13px] text-[var(--text-muted)] leading-[1.7]">
						更新すると、他端末からはサインアウトされる
					</p>
				</div>

				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<AuthField
						label="新しいパスワード"
						htmlFor="reset-password"
						hint={passwordHelp}
					>
						<AuthInput
							id="reset-password"
							name="password"
							type="password"
							autoComplete="new-password"
							required
							minLength={12}
							placeholder="12 文字以上"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</AuthField>

					{password ? <PasswordStrength score={strength} /> : null}

					<AuthField
						label="もう一度入力"
						htmlFor="reset-password-confirm"
						error={
							confirmMismatch
								? "入力したパスワードと一致しない"
								: (error ?? null)
						}
					>
						<AuthInput
							id="reset-password-confirm"
							name="password_confirm"
							type="password"
							autoComplete="new-password"
							required
							minLength={12}
							placeholder="同じパスワードをもう一度"
							hasError={confirmMismatch || Boolean(error)}
							value={confirm}
							onChange={(e) => setConfirm(e.target.value)}
						/>
					</AuthField>

					<AuthButton
						type="submit"
						variant="primary"
						size="lg"
						disabled={!canSubmit}
						className="mt-1.5 w-full"
					>
						{submitting ? "更新中…" : "パスワードを更新"}
						<ArrowRight aria-hidden className="size-4" />
					</AuthButton>
				</form>
			</div>
		</main>
	);
}
