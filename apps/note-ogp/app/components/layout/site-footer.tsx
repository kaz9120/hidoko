import { Link } from "react-router";
import packageJson from "../../../package.json";

const X_PROFILE_URL = "https://x.com/kyamamoto9120";
const PERSONAL_SITE_URL = "https://y-kaz.com/";

/**
 * 画面最下端 22px の静的フッター。バージョン・法務リンク・サイト帰属だけを
 * 置く。背景を `--bg-sunken` で一段沈め、エディタ本体との段差を視覚的に
 * 区切る。
 */
export function SiteFooter() {
	return (
		<footer className="flex h-[22px] shrink-0 items-center gap-3 border-border border-t bg-[var(--bg-sunken)] px-3 font-mono text-[10px] text-muted-foreground">
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
