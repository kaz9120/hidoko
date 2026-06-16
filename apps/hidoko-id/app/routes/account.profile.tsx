// /account/profile — 表示名・アバター URL の編集。
// 認証は親レイアウト（routes/account.tsx）の clientLoader が保証する。

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router";
import { AuthButton } from "~/components/auth-button";
import { AuthField, AuthInput } from "~/components/auth-input";
import { Mark } from "~/components/mark";
import { updateProfile } from "~/lib/account-api";
import { ApiError } from "~/lib/auth-api";
import type { AccountContext } from "./account";

export function meta() {
	return [
		{ title: "プロフィール編集｜アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

export default function AccountProfileEditRoute() {
	const { user } = useOutletContext<AccountContext>();

	const [displayName, setDisplayName] = useState(user.displayName ?? "");
	const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [savedAt, setSavedAt] = useState<number | null>(null);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		setSavedAt(null);
		try {
			await updateProfile({
				displayName: displayName.trim() || null,
				avatarUrl: avatarUrl.trim() || null,
			});
			setSavedAt(Date.now());
		} catch (err) {
			const msg =
				err instanceof ApiError
					? err.message
					: "プロフィールを保存できなかった";
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<header>
				<Mark tone="ember">プロフィール編集</Mark>
				<h1 className="mt-2 mb-1 font-medium text-[22px] text-[var(--text-strong)] tracking-[-0.01em]">
					表示名とアバター
				</h1>
				<p className="m-0 text-[13px] text-[var(--text-muted)] leading-[1.7]">
					未入力で保存すると、表示名・アバターはリセットされる
				</p>
			</header>

			<form onSubmit={onSubmit} className="flex max-w-[480px] flex-col gap-4">
				<AuthField
					label="表示名"
					htmlFor="profile-display-name"
					hint="アプリ画面に出る名前。60 文字まで"
				>
					<AuthInput
						id="profile-display-name"
						maxLength={60}
						placeholder="例: 焚き火好きエンジニア"
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
					/>
				</AuthField>

				<AuthField
					label="アバター URL"
					htmlFor="profile-avatar"
					hint="https:// で始まる画像 URL のみ受け付ける"
					error={error}
				>
					<AuthInput
						id="profile-avatar"
						type="url"
						placeholder="https://example.com/avatar.jpg"
						hasError={Boolean(error)}
						value={avatarUrl}
						onChange={(e) => setAvatarUrl(e.target.value)}
					/>
				</AuthField>

				<div className="flex items-center gap-4">
					<AuthButton
						type="submit"
						variant="primary"
						size="md"
						disabled={submitting}
					>
						{submitting ? "保存中…" : "保存"}
						<ArrowRight aria-hidden className="size-4" />
					</AuthButton>
					{savedAt ? (
						<span className="font-mono text-[12px] text-[var(--text-faint)]">
							保存済み
						</span>
					) : null}
				</div>
			</form>
		</div>
	);
}
