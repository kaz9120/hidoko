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

// UI の書体（Takibi の --font-sans / --font-mono）。Takibi の CSS はフォントを
// 読まないので、ここで読む。
const UI_FONTS_HREF =
	"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=LINE+Seed+JP:wght@400;700&display=swap";

// note OGP の台紙は本文 UI と別の書体で組むため、追加 Web フォントを読む。
//
// ウェイトは台紙が実際に使うものだけに絞る。
// ・Shippori Mincho 600 — タイトルとマストヘッドと漢数字
// ・Newsreader 500（正体）— タイトル中のラテンと数字（tsume.ts）
// ・Newsreader 400 / 500（斜体）— 号数。400 は B1 見出しのプレートだけ
// ・JetBrains Mono 600 — VOL. ラベル。UI_FONTS_HREF は 400/500 しか読まないのでここで足す
const OGP_FONTS_HREF =
	"https://fonts.googleapis.com/css2?" +
	[
		"family=Shippori+Mincho:wght@600",
		"family=Newsreader:ital,opsz,wght@0,6..72,500;1,6..72,400;1,6..72,500",
		"family=JetBrains+Mono:wght@600",
		"display=swap",
	].join("&");

export const links: Route.LinksFunction = () => [
	{ rel: "icon", type: "image/svg+xml", href: faviconUrl },
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{ rel: "stylesheet", href: UI_FONTS_HREF },
	{ rel: "stylesheet", href: OGP_FONTS_HREF },
];

// 描く前に、保存した夜と昼の設定を当てる。ThemeToggle と同じキー（takibi-theme）を読む。
// takibi-theme がまだ無ければ、next-themes 時代のキー（theme）の値を一度だけ写して引き継ぐ。
const restoreThemeScript = `try{var s=localStorage,p=s.getItem("takibi-theme");if(p===null){var o=s.getItem("theme");if(o==="light"||o==="dark"){s.setItem("takibi-theme",o);p=o}}var l=p==="light"||(p==="system"&&matchMedia("(prefers-color-scheme: light)").matches);document.documentElement.dataset.theme=l?"light":"dark"}catch(e){}`;

export function Layout({ children }: { children: React.ReactNode }) {
	return (
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
				<Analytics
					gaId={import.meta.env.VITE_GA_ID}
					clarityId={import.meta.env.VITE_CLARITY_ID}
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
		<main className="container mx-auto p-4 pt-16">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
