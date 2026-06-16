// /account/sessions — セッション一覧と失効操作。
// このページで「いま開いている端末」と「過去の端末」の差を見せて、不審なセッションを
// 個別に失効できるようにする。「ぜんぶサインアウト」で current 以外をまとめて失効。

import { Clock, LogOut, Monitor } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AuthButton } from "~/components/auth-button";
import { Mark } from "~/components/mark";
import {
	fetchSessions,
	revokeOtherSessions,
	revokeSession,
	type SessionSummary,
} from "~/lib/account-api";
import { ApiError } from "~/lib/auth-api";

export function meta() {
	return [
		{ title: "セッション｜アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

function summarizeUserAgent(ua: string | null): string {
	if (!ua) return "不明な端末";
	// よく出るブラウザ・OS を簡易抽出。完全な UA パーサは入れない。
	const browser = /Edg\//.test(ua)
		? "Edge"
		: /Chrome\//.test(ua)
			? "Chrome"
			: /Safari\//.test(ua)
				? "Safari"
				: /Firefox\//.test(ua)
					? "Firefox"
					: "ブラウザ";
	const os = /iPhone|iPad/.test(ua)
		? "iOS"
		: /Android/.test(ua)
			? "Android"
			: /Mac OS X/.test(ua)
				? "macOS"
				: /Windows/.test(ua)
					? "Windows"
					: /Linux/.test(ua)
						? "Linux"
						: "";
	return os ? `${browser}・${os}` : browser;
}

function formatTimestamp(ms: number | null): string {
	if (!ms) return "—";
	const d = new Date(ms);
	return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AccountSessionsRoute() {
	const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [bulkRunning, setBulkRunning] = useState(false);

	const load = useCallback(async () => {
		try {
			const res = await fetchSessions();
			setSessions(res.sessions);
		} catch (err) {
			const msg =
				err instanceof ApiError
					? err.message
					: "セッション一覧を取得できなかった";
			setError(msg);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	async function onRevoke(id: string, isCurrent: boolean) {
		if (busyId) return;
		setBusyId(id);
		setError(null);
		try {
			await revokeSession(id);
			if (isCurrent) {
				window.location.href = "/signin";
				return;
			}
			await load();
		} catch (err) {
			const msg =
				err instanceof ApiError ? err.message : "セッションを失効できなかった";
			setError(msg);
		} finally {
			setBusyId(null);
		}
	}

	async function onRevokeOthers() {
		if (bulkRunning) return;
		if (
			!window.confirm(
				"このセッション以外をすべてサインアウトする。続けてもよいか",
			)
		) {
			return;
		}
		setBulkRunning(true);
		setError(null);
		try {
			await revokeOtherSessions();
			await load();
		} catch (err) {
			const msg =
				err instanceof ApiError
					? err.message
					: "他端末のサインアウトに失敗した";
			setError(msg);
		} finally {
			setBulkRunning(false);
		}
	}

	const otherCount = sessions?.filter((s) => !s.isCurrent).length ?? 0;

	return (
		<div className="flex flex-col gap-6">
			<header className="flex items-start justify-between gap-4">
				<div>
					<Mark tone="ember">セッション</Mark>
					<h1 className="mt-2 mb-1 font-medium text-[22px] text-[var(--text-strong)] tracking-[-0.01em]">
						サインインしている端末
					</h1>
					<p className="m-0 text-[13px] text-[var(--text-muted)] leading-[1.7]">
						身に覚えのない端末があれば失効する
					</p>
				</div>
				<AuthButton
					size="sm"
					variant="secondary"
					onClick={onRevokeOthers}
					disabled={bulkRunning || otherCount === 0}
				>
					<LogOut aria-hidden className="size-3.5" />
					{bulkRunning ? "失効中…" : `他端末をぜんぶ失効（${otherCount}）`}
				</AuthButton>
			</header>

			{error ? <p className="text-[12px] text-[var(--rust)]">{error}</p> : null}

			{sessions == null ? (
				<p className="text-[13px] text-[var(--text-faint)]">読み込み中…</p>
			) : (
				<ul className="m-0 flex flex-col gap-2.5 p-0">
					{sessions.map((s) => (
						<li
							key={s.id}
							className="flex items-start gap-4 rounded-md border border-[var(--border)] bg-[var(--bg-overlay)] px-4 py-3.5"
						>
							<Monitor
								aria-hidden
								className="mt-1 size-4 text-[var(--ember-400)]"
							/>
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2.5">
									<span className="text-[14px] text-[var(--text-strong)]">
										{summarizeUserAgent(s.userAgent)}
									</span>
									{s.isCurrent ? (
										<span
											className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-[var(--ember-400)]"
											style={{
												borderColor:
													"color-mix(in oklab, var(--ember-400) 32%, transparent)",
												backgroundColor:
													"color-mix(in oklab, var(--ember-400) 14%, transparent)",
											}}
										>
											このブラウザ
										</span>
									) : null}
								</div>
								<div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-[11px] text-[var(--text-faint)]">
									<span className="flex items-center gap-1">
										<Clock aria-hidden className="size-3" />
										最終 {formatTimestamp(s.lastSeenAt ?? s.createdAt)}
									</span>
									{s.ip ? <span>{s.ip}</span> : null}
								</div>
							</div>
							<AuthButton
								size="sm"
								variant="ghost"
								disabled={busyId === s.id}
								onClick={() => onRevoke(s.id, s.isCurrent)}
							>
								{busyId === s.id
									? "失効中…"
									: s.isCurrent
										? "このブラウザを失効"
										: "失効"}
							</AuthButton>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
