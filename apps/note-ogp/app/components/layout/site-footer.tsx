import { Link } from "react-router";
import packageJson from "../../../package.json";

const X_PROFILE_URL = "https://x.com/kyamamoto9120";
const PERSONAL_SITE_URL = "https://y-kaz.com/";

/**
 * 画面最下端の静的フッター。バージョン・法務リンク・サイト帰属だけを置く。
 * 背景を `--bg-sunken` で一段沈め、エディタ本体との段差を視覚的に区切る。
 * 通常は 1 行 22px で、横幅が足りない小画面では折り返して複数行になる。
 */
export function SiteFooter() {
	return (
		<footer className="flex min-h-[22px] shrink-0 flex-wrap items-center gap-x-3 gap-y-0.5 border-border border-t bg-[var(--bg-sunken)] px-3 py-0.5 font-mono text-[10px] text-muted-foreground">
			<span>v{packageJson.version}</span>
			<Sep />
			<FooterLink to="/privacy">プライバシーポリシー</FooterLink>
			<Sep />
			<FooterLink to="/terms">利用規約</FooterLink>
			<span className="ml-auto" />
			<FooterLink href={X_PROFILE_URL}>powered by @kyamamoto9120</FooterLink>
			<Sep />
			<FooterLink href={PERSONAL_SITE_URL}>y-kaz.com ↗</FooterLink>
		</footer>
	);
}

/**
 * フッター内のリンク。色は tokens.css のグローバルな `a` スタイル
 * (accent + hover で accent-hover) に任せる。`to` なら内部遷移 (Link)、
 * `href` なら外部リンク (別タブ)。
 */
function FooterLink({
	to,
	href,
	children,
}: {
	to?: string;
	href?: string;
	children: React.ReactNode;
}) {
	if (to) {
		return <Link to={to}>{children}</Link>;
	}
	return (
		<a href={href} rel="noreferrer" target="_blank">
			{children}
		</a>
	);
}

function Sep() {
	return (
		<span aria-hidden="true" className="text-[var(--text-faint)]">
			·
		</span>
	);
}
