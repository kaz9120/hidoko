// /account/danger — 「危険な操作」セクション。今のところアカウント削除のみ。
// 確認のために自分のメールアドレスを入力してもらう（タイポ防止のリチュアル）。

import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router";
import { AuthButton } from "~/components/auth-button";
import { AuthField, AuthInput } from "~/components/auth-input";
import { Mark } from "~/components/mark";
import { deleteAccount } from "~/lib/account-api";
import { ApiError } from "~/lib/auth-api";
import type { AccountContext } from "./account";

export function meta() {
	return [
		{ title: "危険な操作｜アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

export default function AccountDangerRoute() {
	const { user } = useOutletContext<AccountContext>();
	const [confirmEmail, setConfirmEmail] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const matches = confirmEmail.trim().toLowerCase() === user.email;

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!matches) return;
		if (!window.confirm("本当にアカウントを削除する。元には戻せない")) {
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			await deleteAccount({ confirmEmail });
			window.location.href = "/signin";
		} catch (err) {
			const msg = err instanceof ApiError ? err.message : "削除できなかった";
			setError(msg);
			setSubmitting(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<header>
				<Mark tone="muted">危険な操作</Mark>
				<h1 className="mt-2 mb-1 font-medium text-[22px] text-[var(--text-strong)] tracking-[-0.01em]">
					アカウントの削除
				</h1>
				<p className="m-0 text-[13px] text-[var(--text-muted)] leading-[1.7]">
					削除するとアカウントとセッション・連携・トークンを含めて消える。元には戻せない
				</p>
			</header>

			<div
				className="rounded-md border bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] p-4"
				style={{
					borderColor: "color-mix(in oklab, var(--danger) 35%, transparent)",
				}}
			>
				<div className="mb-2 inline-flex items-center gap-2 text-[13px] text-[var(--danger)]">
					<AlertTriangle aria-hidden className="size-3.5" />
					ここから先は不可逆
				</div>
				<form onSubmit={onSubmit} className="flex max-w-[480px] flex-col gap-4">
					<AuthField
						label="確認"
						htmlFor="danger-confirm-email"
						hint={
							<>
								本気で削除するなら、現在のメールアドレス
								<span className="ml-1 font-mono text-[12px]">{user.email}</span>{" "}
								をそのまま入力する
							</>
						}
						error={error}
					>
						<AuthInput
							id="danger-confirm-email"
							type="email"
							autoComplete="off"
							placeholder={user.email}
							hasError={Boolean(error)}
							value={confirmEmail}
							onChange={(e) => setConfirmEmail(e.target.value)}
						/>
					</AuthField>

					<AuthButton
						type="submit"
						variant="primary"
						size="md"
						disabled={submitting || !matches}
						className="bg-[linear-gradient(180deg,var(--danger)_0%,#8b3a1f_100%)] hover:bg-[linear-gradient(180deg,#c2553a_0%,#a04428_100%)]"
					>
						<Trash2 aria-hidden className="size-4" />
						{submitting ? "削除中…" : "アカウントを削除"}
					</AuthButton>
				</form>
			</div>
		</div>
	);
}
