import { ArrowLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { SiteFooter } from "~/components/layout/site-footer";

/**
 * プライバシーポリシー / 利用規約のような静的な文書ページの共通レイアウト。
 * エディタ画面とは独立した読み物なので、SnapcropProvider には依存しない。
 * 上部にエディタへの戻り導線、下部に静的フッターを置く。
 */
export function LegalPage({
	title,
	lastUpdated,
	children,
}: {
	title: string;
	/** 最終更新日 (例: "2026-06-10") */
	lastUpdated: string;
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-30 flex items-center border-border border-b bg-bg/95 px-3 py-2 backdrop-blur md:px-4">
				{/* 文字色は tokens.css のグローバルな a スタイル (accent) に任せる */}
				<Link className="flex items-center gap-1.5 text-sm" to="/">
					<ArrowLeftIcon aria-hidden="true" className="size-4" />
					snapcrop に戻る
				</Link>
			</header>
			<main className="mx-auto w-full max-w-[68ch] flex-1 px-4 py-10 md:px-6">
				<h1 className="font-semibold text-2xl text-text">{title}</h1>
				<p className="mt-2 font-mono text-[var(--text-faint)] text-xs">
					最終更新日: {lastUpdated}
				</p>
				<div className="mt-8 space-y-8">{children}</div>
			</main>
			<SiteFooter />
		</div>
	);
}

/** LegalPage 本文の 1 セクション。見出しと本文をまとめる。 */
export function LegalSection({
	heading,
	children,
}: {
	heading: string;
	children: ReactNode;
}) {
	return (
		<section className="space-y-3">
			<h2 className="font-semibold text-text text-lg">{heading}</h2>
			<div className="space-y-3 text-text-muted text-sm leading-relaxed">
				{children}
			</div>
		</section>
	);
}
