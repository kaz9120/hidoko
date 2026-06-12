import { useCallback } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import type { AnnotationHit } from "~/lib/annotation-hit-test";
import { duplicateArrowAnnotation } from "~/lib/arrow-engine";
import type { ImageMetrics } from "~/lib/crop-engine";
import { duplicateHighlightAnnotation } from "~/lib/highlight-engine";
import { duplicateRectAnnotation } from "~/lib/rect-engine";
import { duplicateTextAnnotation } from "~/lib/text-engine";

/**
 * 注釈を種別を問わず複製して履歴に積む関数を返す。複製は元から 16px
 * 右下へオフセットした位置に置かれ (画像境界では左上へフォールバック)、
 * create 系 action の自動選択で複製側が選択される。⌘D ショートカット
 * (use-duplicate-shortcut.ts) とミニアクションバーの複製ボタンが共用する。
 */
export function useDuplicateAnnotation(): (
	source: AnnotationHit,
	img: ImageMetrics,
) => void {
	const { createAnnotation, createArrow, createText, createHighlight } =
		useSnapcrop();

	return useCallback(
		(source: AnnotationHit, img: ImageMetrics) => {
			switch (source.kind) {
				case "rect":
					createAnnotation(duplicateRectAnnotation(source, img));
					return;
				case "arrow":
					createArrow(duplicateArrowAnnotation(source, img));
					return;
				case "text":
					createText(duplicateTextAnnotation(source, img));
					return;
				case "highlight":
					createHighlight(duplicateHighlightAnnotation(source, img));
					return;
			}
		},
		[createAnnotation, createArrow, createText, createHighlight],
	);
}
