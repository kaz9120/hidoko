import { type RefObject, useEffect, useRef, useState } from "react";
import { useFitScale } from "~/hooks/use-fit-scale";
import type { Fields, TemplateDef } from "~/lib/og-templates";
import { TitleFitContext } from "~/lib/og-templates";
import { TimelinePreview } from "./timeline-preview";

/**
 * 1280×670 のテンプレを縮小プレビューする中央ペイン。
 * `frameRef` を親に返し、PNG 書き出し時の対象 DOM とする。
 *
 * md 以上では親グリッドの高さいっぱいに contain で収め、md 未満（縦積み）では
 * 計測用 wrapper に `aspect-[1280/670]` を与えて幅基準でスケールを決める。
 *
 * メインプレビューの下に、note タイムライン実寸相当の縮小プレビューと
 * 可読性の警告（TimelinePreview）を表示する。タイトルの確定フォントサイズは
 * TitleFitContext 経由で AutoFitTitle から受け取り、`onTitleFontSizeChange`
 * 経由で親 (StatusBar 用) にも通知する。`onScaleChange` も同様、StatusBar
 * の表示倍率表示用。Issue #134 で「ステージ上部の常設テキスト」と
 * 「% キャプション」は StatusBar に集約したので、ここでは描画しない。
 */
export function Stage({
	tpl,
	fields,
	frameRef,
	onScaleChange,
	onTitleFontSizeChange,
}: {
	tpl: TemplateDef;
	fields: Fields;
	frameRef: RefObject<HTMLDivElement | null>;
	onScaleChange?: (scale: number) => void;
	onTitleFontSizeChange?: (fontSize: number | null) => void;
}) {
	const wrapRef = useRef<HTMLDivElement | null>(null);
	const scale = useFitScale(wrapRef, 1280, 670, "contain");
	const Comp = tpl.Comp;
	// メインプレビュー内の AutoFitTitle が確定したフォントサイズ（1280px 基準）
	const [titleFontSize, setTitleFontSize] = useState<number | null>(null);

	// scale / titleFontSize の変化を親 (StatusBar 用) に伝える。
	useEffect(() => {
		onScaleChange?.(scale);
	}, [scale, onScaleChange]);
	useEffect(() => {
		onTitleFontSizeChange?.(titleFontSize);
	}, [titleFontSize, onTitleFontSizeChange]);

	return (
		<section className="note-ogp-stage-bg flex h-full flex-col border-b border-border md:border-r md:border-b-0">
			{/* justify-center ではなく上下の auto margin で中央寄せする —
			    高さが足りず overflow-y-auto でスクロールになったときも
			    先頭が切れずに届くようにするため */}
			<div className="flex min-h-0 flex-1 flex-col items-center gap-3 p-4 md:gap-4 md:overflow-y-auto md:p-8">
				<div
					ref={wrapRef}
					className="mt-auto flex aspect-[1280/670] w-full items-center justify-center md:aspect-auto md:min-h-[180px] md:flex-1"
				>
					<div style={{ width: 1280 * scale, height: 670 * scale }}>
						<div
							ref={frameRef}
							className="origin-top-left overflow-hidden rounded-[4px]"
							style={{
								width: 1280,
								height: 670,
								transform: `scale(${scale})`,
								boxShadow:
									"0 24px 80px color-mix(in oklab, var(--ink-0) 60%, transparent), 0 2px 0 color-mix(in oklab, var(--ink-0) 40%, transparent), 0 0 0 1px var(--border)",
							}}
						>
							<TitleFitContext.Provider value={setTitleFontSize}>
								<Comp f={fields} />
							</TitleFitContext.Provider>
						</div>
					</div>
				</div>
				<div className="mb-auto max-w-full flex-shrink-0">
					<TimelinePreview
						tpl={tpl}
						fields={fields}
						titleFontSize={titleFontSize}
					/>
				</div>
			</div>
		</section>
	);
}
