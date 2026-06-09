import type { Decorator } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";

/**
 * react-router の MemoryRouter で wrap する decorator。
 * `<NavLink>` / `<Link>` / `useNavigate` 等を使う component の story で必須。
 *
 * 使い方:
 *   parameters: { router: { initialPath: "/week" } },
 *   decorators: [withRouter],
 *
 * 既存ルートと一致しない path を渡しても、Routes でラップしないので問題ない。
 * NavLink の active 判定だけが path に依存するので、active 表示を確認したい
 * story では `parameters.router.initialPath` を当該 URL に合わせる。
 */
export const withRouter: Decorator = (Story, context) => {
	const routerParams = context.parameters?.router as
		| { initialPath?: string }
		| undefined;
	const initialPath = routerParams?.initialPath ?? "/";
	return (
		<MemoryRouter initialEntries={[initialPath]}>
			<Story />
		</MemoryRouter>
	);
};

/**
 * Hidoko のセマンティックトークン上で「面 (bg-raised)」に置かれる要素の
 * 見え方を確認するための薄い枠付き wrapper。layout: "padded" / "fullscreen"
 * では捉えにくい「カード上に載った時のスケール感」を story で再現する。
 */
export const withSurfacePadding: Decorator = (Story) => (
	<div className="w-full max-w-[640px] rounded-lg border border-border bg-bg-raised p-6 shadow-card">
		<Story />
	</div>
);
