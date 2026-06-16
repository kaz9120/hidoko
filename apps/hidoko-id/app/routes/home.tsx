import { type LoaderFunctionArgs, redirect } from "react-router";
import { fetchMe } from "~/lib/account-api";
import { ApiError } from "~/lib/auth-api";

/**
 * トップに来た人を振り分ける:
 *   - 認証済み: /account
 *   - 未認証: /signin（return_to が付いていればそのまま引き継ぐ）
 *
 * 認証判定は /api/me を 1 回叩くだけ。失敗（401）= 未認証として扱う。
 */
export async function clientLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const returnTo = url.searchParams.get("return_to");

	try {
		await fetchMe();
		throw redirect("/account");
	} catch (err) {
		if (err instanceof Response) throw err;
		if (err instanceof ApiError && err.status === 401) {
			const target = returnTo
				? `/signin?return_to=${encodeURIComponent(returnTo)}`
				: "/signin";
			throw redirect(target);
		}
		// 想定外のエラーでも signin に振っておく（fail closed）。
		throw redirect("/signin");
	}
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
