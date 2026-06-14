import { type LoaderFunctionArgs, redirect } from "react-router";

export async function clientLoader({ request }: LoaderFunctionArgs) {
	// ?return_to を引き継いで /signin に送る。トップに直接来た人へのデフォルト導線。
	const url = new URL(request.url);
	const returnTo = url.searchParams.get("return_to");
	const target = returnTo
		? `/signin?return_to=${encodeURIComponent(returnTo)}`
		: "/signin";
	throw redirect(target);
}

export function meta() {
	return [
		{ title: "アカウント" },
		{ name: "robots", content: "noindex,nofollow" },
	];
}

export default function Home() {
	return null;
}
