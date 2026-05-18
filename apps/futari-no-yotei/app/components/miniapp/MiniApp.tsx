import type { ReactNode } from "react";
import { BottomTabs } from "./BottomTabs";
import { MiniHeader, type MiniHeaderProps } from "./MiniHeader";

type Props = {
	/** ヘッダーを出すなら必須。`showHeader=false` のときは無視される。 */
	title?: string;
	subtitle?: string;
	leading?: ReactNode;
	trailing?: ReactNode;
	showHeader?: boolean;
	showTabs?: boolean;
	children: ReactNode;
};

/**
 * LINE Mini App の外枠（縦長コンテナ + ヘッダー + コンテンツ + 下タブ）。
 *
 * プロトタイプの Android フレームは design canvas 用の都合なので落としている。
 * 実機では `max-w-md mx-auto min-h-dvh` の縦長 layout でレンダリングし、
 * デスクトップで開いたときも中央寄せでスマホ幅を維持する。
 */
export function MiniApp({
	title,
	subtitle,
	leading,
	trailing,
	showHeader = true,
	showTabs = true,
	children,
}: Props) {
	return (
		<div className="relative mx-auto flex min-h-dvh max-w-md flex-col bg-bg text-text">
			{showHeader ? (
				<MiniHeader
					title={title ?? ""}
					subtitle={subtitle}
					leading={leading}
					trailing={trailing}
				/>
			) : null}
			<div className="relative flex-1">{children}</div>
			{showTabs ? <BottomTabs /> : null}
		</div>
	);
}

export type { MiniHeaderProps };
