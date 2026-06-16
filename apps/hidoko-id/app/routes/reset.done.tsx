import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { AuthButton } from "~/components/auth-button";
import { LogoMark } from "~/components/logo-mark";
import { Mark } from "~/components/mark";

export function meta() {
	return [
		{ title: "更新が完了｜パスワード再設定" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

export default function ResetDoneRoute() {
	const navigate = useNavigate();
	return (
		<main className="relative grid min-h-dvh place-items-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
			<div className="absolute inset-x-6 top-6 flex items-center">
				<LogoMark size={22} title="アカウント" />
			</div>

			<div className="w-full max-w-[420px] text-center">
				<div
					className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-full border bg-[color-mix(in_oklab,var(--moss)_18%,transparent)]"
					style={{
						borderColor: "color-mix(in oklab, var(--moss) 40%, transparent)",
					}}
				>
					<Check aria-hidden className="size-6 text-[#b9c79a]" />
				</div>

				<Mark tone="ember">更新が完了</Mark>
				<h1 className="mt-2 mb-3.5 font-medium text-[22px] text-[var(--text-strong)]">
					新しいパスワードで続行する
				</h1>
				<p className="mb-7 text-[13px] text-[var(--text-muted)] leading-[1.75]">
					パスワードを更新した。
					<br />
					安全のため、他端末からはサインアウトした
				</p>

				<AuthButton
					type="button"
					variant="primary"
					size="lg"
					onClick={() => navigate("/signin")}
				>
					サインインへ
					<ArrowRight aria-hidden className="size-4" />
				</AuthButton>
			</div>
		</main>
	);
}
