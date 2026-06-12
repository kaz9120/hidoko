import { useCallback, useMemo } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import type { AnnotationLists } from "~/lib/annotation-hit-test";
import {
	bringForwardPatch,
	bringToFrontPatch,
	sendBackwardPatch,
	sendToBackPatch,
	type ZOrderPatch,
} from "~/lib/annotation-z-order";

export type ZOrderActions = {
	/** 1 段前面へ。最前面なら no-op。 */
	bringForward: (id: string) => void;
	/** 1 段背面へ。最背面なら no-op。 */
	sendBackward: (id: string) => void;
	/** 最前面へ。 */
	bringToFront: (id: string) => void;
	/** 最背面へ。 */
	sendToBack: (id: string) => void;
};

/**
 * 注釈の z 操作 (#105) を種別を問わず履歴に積む関数群を返す。実体は
 * annotation-z-order.ts が算出した zIndex を、該当種別の update action
 * (patch: { zIndex }) として dispatch するだけ — update op 1 つに載るので
 * undo 1 回でそのまま戻る。ショートカット (use-z-order-shortcuts.ts) と
 * ミニアクションバー (image-stage.tsx) が共用する。
 */
export function useZOrderActions(): ZOrderActions {
	const {
		annotations,
		arrows,
		texts,
		highlights,
		updateAnnotation,
		updateArrow,
		updateText,
		updateHighlight,
	} = useSnapcrop();

	const lists = useMemo<AnnotationLists>(
		() => ({ annotations, arrows, texts, highlights }),
		[annotations, arrows, texts, highlights],
	);

	const apply = useCallback(
		(patch: ZOrderPatch | null) => {
			if (!patch) return;
			switch (patch.kind) {
				case "rect":
					updateAnnotation(patch.id, { zIndex: patch.zIndex });
					return;
				case "arrow":
					updateArrow(patch.id, { zIndex: patch.zIndex });
					return;
				case "text":
					updateText(patch.id, { zIndex: patch.zIndex });
					return;
				case "highlight":
					updateHighlight(patch.id, { zIndex: patch.zIndex });
					return;
			}
		},
		[updateAnnotation, updateArrow, updateText, updateHighlight],
	);

	return useMemo<ZOrderActions>(
		() => ({
			bringForward: (id) => apply(bringForwardPatch(lists, id)),
			sendBackward: (id) => apply(sendBackwardPatch(lists, id)),
			bringToFront: (id) => apply(bringToFrontPatch(lists, id)),
			sendToBack: (id) => apply(sendToBackPatch(lists, id)),
		}),
		[apply, lists],
	);
}
