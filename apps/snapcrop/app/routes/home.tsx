export function meta() {
	return [
		{ title: "snapcrop" },
		{ name: "description", content: "ブラウザで動く画像エディタ" },
	];
}

export default function Home() {
	return (
		<main className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold">snapcrop</h1>
				<p className="mt-2 text-sm opacity-60">
					React Router 7 + Cloudflare Workers
				</p>
			</div>
		</main>
	);
}
