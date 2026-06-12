import { sortAnnotationsByZ } from "~/lib/annotation-z-order";
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
 * (#103)。複製 (#104) や z-order 制御 (#105) もこの走査順を前提に乗る。
 *
 * 全種別を zIndex 昇順に 1 本へ合流し (annotation-z-order.ts)、前面側
 * (末尾) から 1 件ずつ当てる。描画 (image-stage / image-export) と同じ並び
 * なので、「見えている一番手前の注釈」が勝つ。z 操作をしていないドキュメント
 * では従来どおり highlight → text → arrow → rect の順になる。
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
	const ordered = sortAnnotationsByZ(lists);
	for (let i = ordered.length - 1; i >= 0; i--) {
		const a = ordered[i];
		switch (a.kind) {
			case "highlight":
				if (hitTestHighlight([a], imgX, imgY, 8 / zoom)) return a;
				break;
			case "text":
				if (hitTestText([a], imgX, imgY, 4 / zoom)) return a;
				break;
			case "arrow":
				if (hitTestArrow([a], imgX, imgY, 8 / zoom)) return a;
				break;
			case "rect":
				if (hitTestRect([a], imgX, imgY)) return a;
				break;
		}
	}
	return null;
}
