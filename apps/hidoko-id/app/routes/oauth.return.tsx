import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { LogoMark } from "~/components/logo-mark";
import { Mark } from "~/components/mark";
import { extractHost, isLikelyValidReturnTo } from "~/lib/return-to";

export function meta() {
	return [
		{ title: "戻る｜アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

// 戻り先のホストからアプリ名らしいラベルを作る。"snapcrop.y-kaz.com" → "snapcrop"。
function appLabelFromHost(host: string): string {
	const head = host.split(".")[0];
	return head?.replace(/-/g, " ") ?? "アプリ";
}

export default function OAuthReturnRoute() {
	const [params] = useSearchParams();
	const next = params.get("next") ?? params.get("return_to") ?? "";
	const valid = isLikelyValidReturnTo(next);
	const host = extractHost(next);
	const label = appLabelFromHost(host);

	const [tickedOnce, setTickedOnce] = useState(false);
	useEffect(() => {
		// 着地アニメーションを 600ms だけ見せてから飛ばす。
		// 次スライスで workers-oauth-provider に置き換えたとき、ここに code 交換待ちの処理が入る。
		if (!valid) return;
		const id = window.setTimeout(() => {
			setTickedOnce(true);
			window.location.replace(next);
		}, 600);
		return () => window.clearTimeout(id);
	}, [next, valid]);

	if (!valid) {
		return (
			<main className="grid min-h-dvh place-items-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
				<div className="w-full max-w-[420px] text-center">
					<LogoMark size={28} title="アカウント" />
					<Mark tone="ember" className="mt-6">
						REDIRECT BLOCKED
					</Mark>
					<h1 className="mt-2 mb-3.5 font-medium text-[22px] text-[var(--text-strong)]">
						戻り先が不正
					</h1>
					<p className="text-[13px] text-[var(--text-muted)] leading-[1.75]">
						許可されていない URL への遷移は止めた。最初からやり直す
					</p>
					<div className="mt-6">
						<Link
							to="/signin"
							className="font-medium text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)]"
						>
							サインインへ →
						</Link>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="relative grid min-h-dvh place-items-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
			<div className="absolute inset-x-6 top-6 flex items-center">
				<LogoMark size={22} title="アカウント" />
			</div>

			<div className="w-full max-w-[380px] text-center">
				<div className="relative mx-auto mb-5 size-14">
					<div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
					<div className="hidoko-id-spin absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent)] border-r-[var(--accent)]" />
					<div className="absolute inset-0 grid place-items-center">
						<Flame
							aria-hidden
							className="hidoko-id-pulse size-5 text-[var(--accent)]"
						/>
					</div>
				</div>

				<Mark tone="ember">REDIRECTING</Mark>
				<h1 className="mt-2 mb-3.5 font-medium text-[20px] text-[var(--text-strong)]">
					<span className="font-mono">{label}</span> に戻る
				</h1>
				<p className="text-[13px] text-[var(--text-muted)] leading-[1.75]">
					そのまま待つ。自動的に元のアプリへ戻る
				</p>

				<div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-1.5 font-mono text-[11px] text-[var(--text-faint)] tracking-[0.05em]">
					<span
						className="hidoko-id-pulse size-1.5 rounded-full"
						style={{ background: "var(--accent)" }}
					/>
					<span>{host}</span>
				</div>

				{tickedOnce ? (
					<p className="mt-6 text-[12px] text-[var(--text-faint)]">
						自動で遷移しない場合は{" "}
						<a
							href={next}
							className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
						>
							ここを押す
						</a>
					</p>
				) : null}
			</div>
		</main>
	);
}
