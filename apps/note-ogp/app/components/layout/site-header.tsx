import logoCreamUrl from "takibi-design-system/assets/logo/mark-cream.svg?url";
import logoDarkUrl from "takibi-design-system/assets/logo/mark-dark.svg?url";
import { ThemeToggle } from "../theme-toggle";

/**
 * 画面最上段のヘッダ。左はロゴとアプリ名、右は ThemeToggle。
 *
 * プロフィール（ブランド表記と炎マーク）の編集はパネルのプロジェクト欄に
 * 一本化したので、ここに編集の入口は置かない。
 */
export function SiteHeader() {
	return (
		<header className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-line bg-surface-raised px-4 md:px-5">
			<div className="flex items-center gap-2.5">
				{/* 夜と昼のロゴは CSS（light:）で出し分ける。JS で選ぶと描いた直後に入れ替わって見える */}
				<img
					alt=""
					aria-hidden="true"
					className="size-5 light:hidden"
					src={logoDarkUrl}
				/>
				<img
					alt=""
					aria-hidden="true"
					className="hidden size-5 light:block"
					src={logoCreamUrl}
				/>
				<h1 className="text-sm font-semibold tracking-tight text-fg">
					note カバー画像
				</h1>
			</div>
			<div className="ml-auto flex items-center gap-1.5">
				<ThemeToggle />
			</div>
		</header>
	);
}
