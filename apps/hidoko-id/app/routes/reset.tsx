import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthButton } from "~/components/auth-button";
import { AuthField, AuthInput } from "~/components/auth-input";
import { LogoMark } from "~/components/logo-mark";
import { Mark } from "~/components/mark";
import { ApiError, resetRequest } from "~/lib/auth-api";

export function meta() {
	return [
		{ title: "パスワード再設定｜アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

export default function ResetRoute() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			const res = await resetRequest({ email });
			const next = new URLSearchParams({ email: res.email });
			if (res.devResetUrl) next.set("dev_reset_url", res.devResetUrl);
			navigate(`/reset/sent?${next.toString()}`);
		} catch (err) {
			const message =
				err instanceof ApiError
					? err.message
					: "送信できなかった。時間をおいてやり直す";
			setError(message);
			setSubmitting(false);
		}
	}

	return (
		<main className="relative grid min-h-dvh place-items-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
			<div className="absolute inset-x-6 top-6 flex items-center">
				<LogoMark size={22} title="アカウント" />
			</div>

			<div className="w-full max-w-[400px]">
				<div className="mb-7">
					<Mark tone="ember">パスワード再設定</Mark>
					<h1 className="mt-2 mb-2 font-medium text-[24px] text-[var(--text-strong)] tracking-[-0.01em]">
						メールで再設定する
					</h1>
					<p className="m-0 text-[13px] text-[var(--text-muted)] leading-[1.7]">
						登録メールアドレスに再設定リンクを送る。リンクの有効期限は 24 時間
					</p>
				</div>

				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<AuthField label="メール" htmlFor="reset-email" error={error}>
						<AuthInput
							id="reset-email"
							name="email"
							type="email"
							autoComplete="username"
							required
							placeholder="name@example.com"
							hasError={Boolean(error)}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</AuthField>

					<AuthButton
						type="submit"
						variant="primary"
						size="lg"
						disabled={submitting || !email.includes("@")}
						className="mt-1.5 w-full"
					>
						{submitting ? "送信中…" : "再設定リンクを送る"}
						<ArrowRight aria-hidden className="size-4" />
					</AuthButton>
				</form>

				<div className="mt-8 text-center">
					<Link
						to="/signin"
						className="inline-flex items-center gap-1.5 font-medium text-[13px] text-[var(--brand)] hover:text-[var(--brand-hover)]"
					>
						<ArrowLeft aria-hidden className="size-3.5" />
						サインインに戻る
					</Link>
				</div>
			</div>
		</main>
	);
}
