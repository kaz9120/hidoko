import { ThemeProvider } from "next-themes";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import { AgentationDebugGate, Analytics, Toaster, TooltipProvider } from "ui";
import faviconUrl from "ui/assets/logo/mark-cream.svg?url";
import type { Route } from "./+types/root";
import "./globals.css";

// note OGP テンプレ内のタイトルだけ書体を切り替えるため、追加 Web フォントを読む。
// LINE Seed JP は packages/ui の fonts.css にすでに含まれているので重複読み込みしない。
const OGP_FONTS_HREF =
	"https://fonts.googleapis.com/css2?" +
	[
		"family=Shippori+Mincho:wght@400;500;600;700;800",
		"family=Zen+Kaku+Gothic+New:wght@400;500;700;900",
		"family=Klee+One:wght@400;600",
		"family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500",
		"family=Archivo:wght@400;500;600;700;800",
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
	{ rel: "stylesheet", href: OGP_FONTS_HREF },
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		// next-themes が html.class を後付けで切り替えるため、prerender の HTML
		// と差分が出る。SPA でも React の hydration 警告を抑える必要がある。
		<html lang="ja" className="dark" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
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
	return (
		<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
			<TooltipProvider>
				<Outlet />
				<Toaster position="bottom-center" />
			</TooltipProvider>
		</ThemeProvider>
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
