import { type ArrowAnnotation, hitTestArrow } from "~/lib/arrow-engine";
import {
	type HighlightAnnotation,
	hitTestHighlight,
} from "~/lib/highlight-engine";
import { hitTest as hitTestRect, type RectAnnotation } from "~/lib/rect-engine";
import { hitTestText, type TextAnnotation } from "~/lib/text-engine";

/**
 * 種別横断 hit test の結果。各注釈型は `kind` を判別子に持つ discriminated
 * union なので、呼び側は `hit.kind` でそのまま分岐できる。
 */
export type AnnotationHit =
	| RectAnnotation
	| ArrowAnnotation
	| TextAnnotation
	| HighlightAnnotation;

/** 全種別の注釈リストをまとめて受け渡すための入れ物。 */
export type AnnotationLists = {
	annotations: readonly RectAnnotation[];
	arrows: readonly ArrowAnnotation[];
	texts: readonly TextAnnotation[];
	highlights: readonly HighlightAnnotation[];
};

/**
 * どのツール中でも既存注釈を掴めるようにするための、種別をまたいだ hit test
 * (#103)。後続の複製 (#104) や z-order 制御 (#105) もこの走査順を前提に乗る。
 *
 * 種別間の z-order はレイヤー構造 (rect < arrow < text < highlight) で固定
 * なので、最前面の highlight から順に当てる。各種別の hitTest* は配列末尾
 * (= createdAt が新しい = 同種内で前面) から走査するため、全体として
 * 「見えている一番手前の注釈」が勝つ。
 *
 * 許容距離は従来の各 interaction layer が使っていた値をそのまま引き継ぐ:
 * 矢印・マーカーは画面上約 8px、テキストは約 4px を zoom で画像 px に換算し、
 * 縮小表示でも掴みやすくする。矩形は面で当てるので許容距離なし。
 */
export function hitTestAnnotations(
	lists: AnnotationLists,
	imgX: number,
	imgY: number,
	zoom: number,
): AnnotationHit | null {
	return (
		hitTestHighlight(lists.highlights, imgX, imgY, 8 / zoom) ??
		hitTestText(lists.texts, imgX, imgY, 4 / zoom) ??
		hitTestArrow(lists.arrows, imgX, imgY, 8 / zoom) ??
		hitTestRect(lists.annotations, imgX, imgY)
	);
}
