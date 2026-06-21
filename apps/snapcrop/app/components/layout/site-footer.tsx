import { useState } from "react";
import { Link } from "react-router";
import { LegalDialog } from "~/components/layout/legal-dialog";
import {
	PRIVACY_LAST_UPDATED,
	PrivacyContent,
} from "~/components/legal/privacy-content";
import {
	TERMS_LAST_UPDATED,
	TermsContent,
} from "~/components/legal/terms-content";
import packageJson from "../../../package.json";

const X_PROFILE_URL = "https://x.com/kyamamoto9120";
const PERSONAL_SITE_URL = "https://y-kaz.com/";

/**
 * 画面最下端 22px の静的フッター。動的なアプリ状態を出すステータスバー
 * (上段) とは役割を分け、バージョン・法務リンク・サイト帰属だけを置く。
 * 背景を `--bg-sunken` で一段沈め、上段との段差を視覚的に区切る。
 *
 * 法務リンクはクリックで Dialog を開き、編集中の画像状態を保ったまま読める
 * ようにする。直リンクや外部参照のために `/privacy` / `/terms` の単独ページ
 * も残してある。
 */
export function SiteFooter() {
	const [privacyOpen, setPrivacyOpen] = useState(false);
	const [termsOpen, setTermsOpen] = useState(false);

	return (
		<>
			<footer className="flex h-[22px] shrink-0 items-center gap-3 border-border border-t bg-[var(--bg-sunken)] px-3 font-mono text-[10px] text-text-muted">
				<span>v{packageJson.version}</span>
				<Sep />
				<FooterLink onClick={() => setPrivacyOpen(true)}>
					プライバシーポリシー
				</FooterLink>
				<Sep />
				<FooterLink onClick={() => setTermsOpen(true)}>利用規約</FooterLink>
				<span className="ml-auto" />
				<FooterLink href={X_PROFILE_URL}>
					created by 焚き火を愛するエンジニア
				</FooterLink>
				<Sep />
				<FooterLink href={PERSONAL_SITE_URL}>y-kaz.com ↗</FooterLink>
			</footer>
			<LegalDialog
				lastUpdated={PRIVACY_LAST_UPDATED}
				onOpenChange={setPrivacyOpen}
				open={privacyOpen}
				title="プライバシーポリシー"
			>
				<PrivacyContent />
			</LegalDialog>
			<LegalDialog
				lastUpdated={TERMS_LAST_UPDATED}
				onOpenChange={setTermsOpen}
				open={termsOpen}
				title="利用規約"
			>
				<TermsContent />
			</LegalDialog>
		</>
	);
}

/**
 * フッター内のリンク。色は tokens.css のグローバルな `a` スタイル
 * (accent + hover で accent-hover) に任せる。`to` なら内部遷移 (Link)、
 * `href` なら外部リンク (別タブ)、`onClick` なら button (Dialog トリガ等)。
 */
function FooterLink({
	to,
	href,
	onClick,
	children,
}: {
	to?: string;
	href?: string;
	onClick?: () => void;
	children: React.ReactNode;
}) {
	if (onClick) {
		// tokens.css の a スタイルを button に手で合わせる。
		return (
			<button
				className="cursor-pointer text-[var(--accent)] transition-colors duration-(--duration) ease-(--ease) hover:text-[var(--accent-hover)]"
				onClick={onClick}
				type="button"
			>
				{children}
			</button>
		);
	}
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
