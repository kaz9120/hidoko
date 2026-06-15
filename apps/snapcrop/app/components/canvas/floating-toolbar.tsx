import type { ReactNode } from "react";

/**
 * 描画領域の上部中央に固定で出る共通バー (#147 Phase 3 / 上部固定版)。
 *
 * 以前は選択中の図形 bbox 上辺に貼り付く絶対配置だったが、bbox 位置によって
 * 上反転や画面外はみ出しが発生していたため、描画領域の上端中央に固定する
 * 配置に統一した。
 *
 * 親は editor-canvas の `<div relative>` (viewport の兄弟)。viewport の中に
 * 置くと scroll に追従してしまうので、必ず viewport の外側で render する。
 *
 * 表示制御:
 *   - 選択がないとき / crop モードでないときは親が描画しない (条件付きレンダリング)
 *   - 位置固定なので interaction 中も同じ場所に出続ける (位置のチラつきが
 *     起きないため visible 制御は不要)
 */
export function FloatingToolbar({ children }: { children: ReactNode }) {
	return (
		<div
			role="toolbar"
			aria-label="選択中のプロパティ"
			className="pointer-events-auto absolute top-3 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-md border border-border bg-[rgba(26,24,20,0.96)] px-2 py-1.5 text-(--text) shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,240,220,0.04)] backdrop-blur"
		>
			{children}
		</div>
	);
}
