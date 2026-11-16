import { AgentationDebugGate, Analytics } from "app-kit";
import { useLayoutEffect } from "react";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import { restoreTheme, Toaster, TooltipProvider } from "takibi-design-system";
import faviconUrl from "takibi-design-system/assets/logo/mark-cream.svg?url";
import type { Route } from "./+types/root";
import "./globals.css";

export const links: Route.LinksFunction = () => [
	{ rel: "icon", type: "image/svg+xml", href: faviconUrl },
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=LINE+Seed+JP:wght@400;700&display=swap",
	},
];

/*
 * 描く前に、保存した夜と昼の設定を当てる。Takibi の useThemePreference と同じキー
 * （takibi-theme）を読む。まだ無ければ、以前の next-themes が残したキー（theme）の
 * "light" / "dark" を引き継ぎ、takibi-theme に書き写す。
 */
const restoreThemeScript = `try{var s=localStorage,p=s.getItem("takibi-theme");if(p===null){var o=s.getItem("theme");if(o==="light"||o==="dark"){p=o;s.setItem("takibi-theme",o)}}var l=p==="light"||(p==="system"&&matchMedia("(prefers-color-scheme: light)").matches);document.documentElement.dataset.theme=l?"light":"dark"}catch(e){}`;

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		// 描く前のスクリプトが data-theme を当てるので、prerender の HTML と差分が出る
		<html lang="ja" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: 描く前にテーマを当てる、固定の短いスクリプト */}
				<script dangerouslySetInnerHTML={{ __html: restoreThemeScript }} />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				{/*
					snapcrop は「画像データを第三者に送信しない」をプライバシー上の
					約束にしているので、Clarity のセッション記録は strict マスクで
					走らせる (Issue #79)。
				*/}
				<Analytics
					gaId={import.meta.env.VITE_GA_ID}
					clarityId={import.meta.env.VITE_CLARITY_ID}
					clarityMask="strict"
				/>
				<AgentationDebugGate />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	// React が prerender の HTML を引き継ぐと、描く前に当てた data-theme が外れるので、引き継いだあとに当て直す
	// 描く前に当て直す。useEffect だと、昼の利用者に夜の画面が 1 フレーム出る
	useLayoutEffect(() => restoreTheme(), []);
	return (
		<TooltipProvider>
			<Outlet />
			<Toaster />
		</TooltipProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "エラーが発生しました";
	let details = "予期しないエラーが発生しました。";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "エラー";
		details =
			error.status === 404
				? "お探しのページは見つかりませんでした。"
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container mx-auto p-4 pt-16 text-fg">
			<h1 className="font-semibold text-2xl text-fg-strong">{message}</h1>
			<p className="mt-2 text-fg-muted">{details}</p>
			{stack && (
				<pre className="mt-4 w-full overflow-x-auto rounded-md bg-surface-overlay p-4 text-xs">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
