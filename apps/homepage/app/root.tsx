import faviconUrl from "design-system/assets/logo/mark-cream.svg?url";
import { ThemeProvider } from "next-themes";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import { Toaster, TooltipProvider } from "ui";
import type { Route } from "./+types/root";
import "./globals.css";

export const links: Route.LinksFunction = () => [
	{ rel: "icon", type: "image/svg+xml", href: faviconUrl },
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
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			disableTransitionOnChange
			enableSystem={false}
		>
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
		<main className="mx-auto max-w-2xl px-6 pt-24 pb-16 text-foreground">
			<h1 className="text-2xl font-semibold text-text-strong">{message}</h1>
			<p className="mt-2 text-muted-foreground">{details}</p>
			{stack && (
				<pre className="mt-4 w-full overflow-x-auto rounded-md bg-secondary p-4 text-xs">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
