import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthButton } from "~/components/auth-button";
import { AuthField, AuthInput } from "~/components/auth-input";
import { Divider } from "~/components/divider";
import { Embers } from "~/components/embers";
import { GoogleGIcon } from "~/components/google-g-icon";
import { LogoMark } from "~/components/logo-mark";
import { Mark } from "~/components/mark";
import { ApiError, signin } from "~/lib/auth-api";
import { oauthErrorMessage } from "~/lib/oauth-errors";

export function meta() {
	return [
		{ title: "サインイン｜アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

const FOOTER_APPS = [
	"snapcrop",
	"note ogp",
	"futari no yotei",
	"homepage",
] as const;

export default function SigninRoute() {
	const [params] = useSearchParams();
	const initialEmail = params.get("email") ?? "";
	const justVerified = params.get("verified") === "1";
	const returnTo = params.get("return_to") ?? "";
	const oauthError = params.get("oauth_error");

	const [email, setEmail] = useState(initialEmail);
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(
		oauthError ? oauthErrorMessage(oauthError) : null,
	);
	const [isWide, setIsWide] = useState(false);

	const googleStartHref = returnTo
		? `/oauth/start/google?return_to=${encodeURIComponent(returnTo)}`
		: "/oauth/start/google";

	useEffect(() => {
		const mql = window.matchMedia("(min-width: 1024px)");
		const update = () => setIsWide(mql.matches);
		update();
		mql.addEventListener("change", update);
		return () => mql.removeEventListener("change", update);
	}, []);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			const res = await signin({
				email,
				password,
				...(returnTo ? { returnTo } : {}),
			});
			window.location.href = res.redirectTo;
		} catch (err) {
			const message =
				err instanceof ApiError
					? err.message
					: "サインインできなかった。時間をおいてやり直す";
			setError(message);
			setSubmitting(false);
		}
	}

	const signupHref = returnTo
		? `/signup?return_to=${encodeURIComponent(returnTo)}`
		: "/signup";

	// フォームカード本体（フルブリードでも narrow でも中身は共通）
	const formCard = (
		<form onSubmit={onSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<Mark tone={isWide ? "muted" : "ember"}>SIGN IN</Mark>
				<h1 className="m-0 font-medium text-[var(--text-strong)] text-2xl tracking-[-0.01em]">
					{isWide ? "続行する" : "サインイン"}
				</h1>
			</div>

			{justVerified ? (
				<div className="rounded-md border border-[color-mix(in_oklab,var(--success)_35%,transparent)] bg-[color-mix(in_oklab,var(--success)_14%,transparent)] px-3.5 py-2.5 text-[13px] text-[#b9c79a]">
					メールアドレスを確認した。続けてサインインする
				</div>
			) : null}

			<AuthField label="メール" htmlFor="signin-email">
				<AuthInput
					id="signin-email"
					name="email"
					type="email"
					autoComplete="username"
					required
					placeholder="name@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</AuthField>

			<AuthField
				label="パスワード"
				htmlFor="signin-password"
				rightLabel={
					<Link
						to="/reset"
						className="text-[12px] font-normal text-[var(--accent)] hover:text-[var(--accent-hover)]"
					>
						忘れた
					</Link>
				}
				error={error}
			>
				<AuthInput
					id="signin-password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					placeholder="••••••••"
					hasError={Boolean(error)}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</AuthField>

			<AuthButton
				type="submit"
				variant="primary"
				size="lg"
				disabled={submitting}
				className="mt-1.5 w-full"
			>
				{submitting ? "サインイン中…" : "サインイン"}
				<ArrowRight aria-hidden className="size-4" />
			</AuthButton>

			<Divider>または</Divider>

			<AuthButton
				type="button"
				variant="secondary"
				className="w-full gap-2.5"
				onClick={() => {
					window.location.href = googleStartHref;
				}}
			>
				<GoogleGIcon />
				Google で続行
			</AuthButton>
		</form>
	);

	if (!isWide) {
		// 中央ミニマル（< 1024px）— top-bar・hero テキスト・marquee・embers なし。
		return (
			<main className="relative grid min-h-dvh place-items-center bg-[var(--bg)] px-6 py-10 text-[var(--text)]">
				<div className="absolute inset-x-6 top-6 flex items-center justify-between text-[13px] text-[var(--text-faint)]">
					<LogoMark size={22} title="アカウント" />
					<div className="flex items-center gap-3">
						<span>アカウントがない</span>
						<Link
							to={signupHref}
							className="inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
						>
							作成
							<ArrowUpRight aria-hidden className="size-3.5" />
						</Link>
					</div>
				</div>
				<div className="w-full max-w-[360px]">{formCard}</div>
			</main>
		);
	}

	// フルブリード — ヒーロー型（≥ 1024px）。
	return (
		<main className="hidoko-id-hero-bg relative min-h-dvh overflow-hidden text-[var(--text)]">
			<Embers density={36} wind={0.03} />

			{/* top bar */}
			<div className="absolute inset-x-11 top-7 z-30 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<LogoMark size={28} title="アカウント" />
					<span className="font-semibold text-[15px] text-[var(--text-strong)] tracking-[-0.02em]">
						共通アカウント
					</span>
				</div>
				<div className="flex items-center gap-5 text-[13px] text-[var(--text-faint)]">
					<Link
						to="/about"
						className="text-[var(--text-muted)] hover:text-[var(--text-strong)]"
					>
						使われている場所
					</Link>
					<Link
						to={signupHref}
						className="inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
					>
						アカウントを作成
						<ArrowUpRight aria-hidden className="size-3.5" />
					</Link>
				</div>
			</div>

			{/* hero */}
			<div className="relative z-20 mx-auto grid h-dvh max-w-[1480px] grid-cols-[1.1fr_0.9fr] items-center gap-14 px-24 pt-24 pb-20">
				<div>
					<LogoMark size={120} className="mb-7 opacity-90" />
					<Mark tone="ember" className="mb-4 gap-2.5">
						<span className="block h-px w-4 bg-current" />
						共通アカウント
					</Mark>
					<h1 className="m-0 mb-5 font-semibold text-[56px] text-[var(--text-strong)] leading-[1.05] tracking-[-0.025em]">
						夜の机に、
						<br />
						ひとつの灯。
					</h1>
					<p className="m-0 mb-3 max-w-[460px] text-[17px] text-[var(--text-muted)] leading-[1.75]">
						一度サインインすれば、次のアプリへは何も訊かれずに戻る。アカウントはひとつ
					</p>
					<p className="m-0 max-w-[460px] text-[14px] text-[var(--text-faint)] leading-[1.75]">
						認証は OAuth 2.1 + PKCE。サードパーティ製のクライアントや MCP
						サーバーも、許可した範囲だけアカウントに触れる
					</p>
				</div>

				<div className="hidoko-id-form-card p-9 pt-9 pb-8">{formCard}</div>
			</div>

			{/* used by marquee */}
			<div className="absolute inset-x-11 bottom-7 z-20 flex items-center gap-4 border-t border-[var(--border-subtle)] pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
				<span className="text-[var(--accent)]">USED BY ／</span>
				{FOOTER_APPS.map((name, i) => (
					<span key={name} className="flex items-center gap-4">
						{i > 0 ? (
							<span className="text-[var(--border)]" aria-hidden>
								·
							</span>
						) : null}
						<span>{name}</span>
					</span>
				))}
				<span className="ml-auto text-[var(--accent)]">
					— {FOOTER_APPS.length} APPS
				</span>
			</div>
		</main>
	);
}
