import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type Props = {
	/** 下タブの表示 / 非表示。オンボーディングや LINE 取り込みフォーム等、
	 * フッターナビを出したくない画面では false を渡す。 */
	showNav?: boolean;
	children: ReactNode;
};

/**
 * アプリ共通のレイアウト。縦長コンテナと下タブだけ提供する薄いラッパ。
 *
 * - LIFF アプリは LINE 側 (LINE app の chrome) がタイトルバーや戻る操作を
 *   出してくれるため、画面内に擬似的なヘッダーを作らない。各 route は
 *   `<h1>` でセマンティックな見出しを置く。
 * - デスクトップで開かれたときも `max-w-md` で中央寄せの縦長 layout を
 *   維持し、モバイル基準で見えるようにする。
 */
export function AppShell({ showNav = true, children }: Props) {
	return (
		<div className="relative mx-auto flex min-h-dvh max-w-md flex-col bg-bg text-text">
			<div className="flex-1">{children}</div>
			{showNav ? <BottomNav /> : null}
		</div>
	);
}
