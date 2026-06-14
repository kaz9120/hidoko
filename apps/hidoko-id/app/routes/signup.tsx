import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Checkbox } from "ui/components/checkbox";
import { AuthButton } from "~/components/auth-button";
import { AuthField, AuthInput } from "~/components/auth-input";
import { LogoMark } from "~/components/logo-mark";
import { Mark } from "~/components/mark";
import { ApiError, signup } from "~/lib/auth-api";
import { checkPassword, passwordHint } from "~/lib/password";

export function meta() {
	return [
		{ title: "アカウントを作る｜アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

const BENEFITS = [
	"無料。クレジットカード不要",
	"支払いはアプリ側で個別に設定",
	"退会はいつでも、痕跡なく",
] as const;

export default function SignupRoute() {
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const returnTo = params.get("return_to") ?? "";

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [terms, setTerms] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isWide, setIsWide] = useState(false);

	useEffect(() => {
		const mql = window.matchMedia("(min-width: 1024px)");
		const update = () => setIsWide(mql.matches);
		update();
		mql.addEventListener("change", update);
		return () => mql.removeEventListener("change", update);
	}, []);

	const passwordCheck = useMemo(() => checkPassword(password), [password]);
	const canSubmit =
		!submitting && email.includes("@") && passwordCheck.ok && terms;

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			const res = await signup({
				email,
				password,
				termsAccepted: terms,
			});
			const next = new URLSearchParams({ email: res.email });
			if (returnTo) next.set("return_to", returnTo);
			if (res.devVerifyUrl) next.set("dev_verify_url", res.devVerifyUrl);
			navigate(`/verify-email?${next.toString()}`);
		} catch (err) {
			const message =
				err instanceof ApiError
					? err.message
					: "アカウントを作れなかった。時間をおいてやり直す";
			setError(message);
			setSubmitting(false);
		}
	}

	const signinHref = returnTo
		? `/signin?return_to=${encodeURIComponent(returnTo)}`
		: "/signin";

	const passwordHelp = password
		? passwordCheck.ok
			? "強度: 並 — 大丈夫"
			: passwordHint(passwordCheck)
		: "英数字を含む 12 文字以上。記号は任意";

	const form = (
		<form onSubmit={onSubmit} className="flex flex-col gap-4">
			<div className="mb-2">
				<Mark tone="ember">SIGN UP</Mark>
				<h1 className="mt-2 mb-0 font-medium text-[28px] text-[var(--text-strong)] tracking-[-0.02em]">
					アカウントを作る
				</h1>
			</div>

			<AuthButton
				type="button"
				variant="secondary"
				disabled
				className="w-full"
				title="次のスライスで対応"
			>
				Google で作成（近日対応）
			</AuthButton>

			<div className="flex items-center gap-3.5">
				<div className="h-px flex-1 bg-[var(--border)]" />
				<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
					メールで作成
				</span>
				<div className="h-px flex-1 bg-[var(--border)]" />
			</div>

			<AuthField label="メール" htmlFor="signup-email" error={error}>
				<AuthInput
					id="signup-email"
					name="email"
					type="email"
					autoComplete="email"
					required
					placeholder="name@example.com"
					hasError={Boolean(error)}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</AuthField>

			<AuthField
				label="パスワード"
				htmlFor="signup-password"
				hint={passwordHelp}
			>
				<AuthInput
					id="signup-password"
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

			<label
				htmlFor="signup-terms"
				className="mt-1 flex items-start gap-2.5 text-[13px] text-[var(--text-muted)]"
			>
				<Checkbox
					id="signup-terms"
					required
					checked={terms}
					onCheckedChange={(v) => setTerms(v === true)}
					className="mt-0.5 data-[state=checked]:border-[var(--ember-600)] data-[state=checked]:bg-[var(--ember-400)] data-[state=checked]:text-[#1a0d05]"
				/>
				<span>
					<Link
						to="/terms"
						className="font-medium text-[var(--ember-400)] hover:text-[var(--ember-300)]"
					>
						利用規約
					</Link>{" "}
					と{" "}
					<Link
						to="/privacy"
						className="font-medium text-[var(--ember-400)] hover:text-[var(--ember-300)]"
					>
						プライバシーポリシー
					</Link>{" "}
					に同意する
				</span>
			</label>

			<AuthButton
				type="submit"
				variant="primary"
				size="lg"
				disabled={!canSubmit}
				className="mt-2"
			>
				{submitting ? "送信中…" : "アカウントを作成"}
				<ArrowRight aria-hidden className="size-4" />
			</AuthButton>
		</form>
	);

	if (!isWide) {
		// narrow（< 1024px）: 左パネル非表示。右パネルだけ中央寄せ。
		return (
			<main className="relative grid min-h-dvh place-items-center bg-[var(--bg)] px-6 py-10 text-[var(--text)]">
				<div className="absolute inset-x-6 top-6 flex items-center justify-between text-[13px] text-[var(--text-faint)]">
					<LogoMark size={22} title="アカウント" />
					<div className="flex items-center gap-3">
						<span>すでに使っている</span>
						<Link
							to={signinHref}
							className="inline-flex items-center gap-1 font-medium text-[var(--ember-400)] hover:text-[var(--ember-300)]"
						>
							サインイン
							<ArrowUpRight aria-hidden className="size-3.5" />
						</Link>
					</div>
				</div>
				<div className="w-full max-w-[380px]">{form}</div>
			</main>
		);
	}

	// desktop（≥ 1024px）: 520px ブランド面 + フォーム面の左右分割。
	return (
		<main className="relative grid min-h-dvh grid-cols-[520px_1fr] text-[var(--text)]">
			{/* brand panel */}
			<aside className="hidoko-id-brand-panel-bg relative flex flex-col overflow-hidden border-[var(--border)] border-r p-11">
				<div className="flex items-center gap-3.5">
					<LogoMark size={28} title="アカウント" />
					<span className="font-semibold text-[17px] text-[var(--text-strong)] tracking-[-0.02em]">
						共通アカウント
					</span>
				</div>

				<div className="my-auto max-w-[380px]">
					<Mark tone="ember">新しいアカウント</Mark>
					<h2 className="mt-3.5 mb-5 font-medium text-[36px] text-[var(--text-strong)] leading-[1.15] tracking-[-0.025em]">
						道具を、
						<br />
						ひとつの灯で繋ぐ。
					</h2>
					<p className="mb-7 text-[14px] text-[var(--text-muted)] leading-[1.75]">
						アカウントを作ると、同じ ID で複数の道具にサインインできる
					</p>

					<ul className="m-0 flex list-none flex-col gap-3 p-0 text-[13px] text-[var(--text-muted)]">
						{BENEFITS.map((b) => (
							<li key={b} className="flex items-start gap-2.5">
								<Check
									aria-hidden
									className="mt-1 size-3.5 text-[var(--ember-400)]"
								/>
								<span>{b}</span>
							</li>
						))}
					</ul>
				</div>

				<Mark className="text-[10px]">
					© {new Date().getFullYear()} — y-kaz
				</Mark>
			</aside>

			{/* form panel */}
			<section className="flex flex-col p-11 pr-16">
				<div className="flex items-center justify-end gap-3 text-[13px] text-[var(--text-faint)]">
					<span>すでに使っている</span>
					<Link
						to={signinHref}
						className="inline-flex items-center gap-1 font-medium text-[var(--ember-400)] hover:text-[var(--ember-300)]"
					>
						サインイン
						<ArrowUpRight aria-hidden className="size-3.5" />
					</Link>
				</div>
				<div className="mx-auto my-auto w-[380px]">{form}</div>
			</section>
		</main>
	);
}
