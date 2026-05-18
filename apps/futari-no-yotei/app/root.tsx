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
import faviconUrl from "ui/assets/logo/mark-cream.svg?url";
import type { Route } from "./+types/root";
import "./globals.css";

export const links: Route.LinksFunction = () => [
	{ rel: "icon", type: "image/svg+xml", href: faviconUrl },
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		// 「ふたりのよてい」は昼 (light) がデフォルト。next-themes が html.class を
		// 後付けで切り替えるため hydration 警告を抑える。
		<html lang="ja" className="light" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, viewport-fit=cover"
				/>
				<meta name="theme-color" content="#fbf8f0" />
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
			defaultTheme="light"
			disableTransitionOnChange
			enableSystem={false}
		>
			<TooltipProvider>
				<Outlet />
				<Toaster position="top-center" />
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
		<main className="mx-auto max-w-md px-5 pt-24 pb-16">
			<h1 className="font-semibold text-2xl text-text-strong">{message}</h1>
			<p className="mt-2 text-muted-foreground">{details}</p>
			{stack && (
				<pre className="mt-4 w-full overflow-x-auto rounded-md bg-secondary p-4 text-xs">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
