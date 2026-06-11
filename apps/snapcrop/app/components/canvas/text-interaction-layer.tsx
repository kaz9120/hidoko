import type React from "react";
import { useRef } from "react";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import type { UseTextEngineResult } from "~/hooks/use-text-engine";
import { hitTestText, type TextAnnotation } from "~/lib/text-engine";

/** これ以上動いたら「クリック」ではなく pan 等の誤爆とみなす画面 px 距離 */
const CLICK_SLOP_PX = 4;

type Drag =
	| { kind: "move"; pointerId: number }
	| {
			kind: "pending-create";
			pointerId: number;
			createPt: { x: number; y: number };
			startClient: { x: number; y: number };
	  }
	| { kind: "cancelled"; pointerId: number };

type Props = {
	engine: UseTextEngineResult;
	texts: readonly TextAnnotation[];
	zoom: number;
	getImagePoint: (
		clientX: number,
		clientY: number,
	) => { x: number; y: number } | null;
};

/**
 * テキストツール選択中だけ stage を覆う透明な hit layer。pointerdown で外接
 * 矩形への hit test を行い、既存テキストがあれば選択 + 移動開始。空クリック
 * (= 動かさず pointerup) でその位置から新規テキストの入力を開始し、既存
 * テキストのダブルクリック (= pointerdown の e.detail >= 2) で再編集に入る。
 * rect / arrow の先例どおり、座標変換は親 (image-stage) から `getImagePoint`
 * を受け取る。
 *
 * インライン編集中の pointerdown は、blur 任せにせず engine.flushEdit() で
 * 先に編集を確定してから通常の hit test に流す。テキストの上なら確定と同じ
 * ジェスチャで移動が始まり (issue #80)、空クリックなら確定だけで終わる
 * (編集の確定と新規作成が 1 クリックで同時に起きないようにする)。
 */
export function TextInteractionLayer({
	engine,
	texts,
	zoom,
	getImagePoint,
}: Props) {
	const { selectAnnotation, spacePressedRef } = useSnapcrop();
	const dragRef = useRef<Drag | null>(null);

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		const pt = getImagePoint(e.clientX, e.clientY);
		if (!pt) return;
		// 編集中のクリックはここで即時 commit し、同じジェスチャを下の hit test
		// に流す (上記コメント参照)。textarea 自体へのクリックはこのレイヤーに
		// 届かない (caret 移動のまま) ので、ここに来るのは「外側」だけ。
		const wasEditing = engine.editing !== null;
		const committed = wasEditing ? engine.flushEdit() : null;
		e.preventDefault();
		// commit 直後のテキストは context 反映前なので、hit 対象を差し替える
		const hitTargets = committed
			? [...texts.filter((t) => t.id !== committed.id), committed]
			: texts;
		// 画面上で約 4px を画像座標に換算した許容距離 (小さい文字でも掴める)
		const hit = hitTestText(hitTargets, pt.x, pt.y, 4 / zoom);
		if (hit) {
			// ダブルクリック (連打 2 回目) は移動ではなく再編集を開始する
			if (e.detail >= 2) {
				selectAnnotation(hit.id);
				engine.beginEdit(hit.id);
				return;
			}
			dragRef.current = { kind: "move", pointerId: e.pointerId };
			e.currentTarget.setPointerCapture(e.pointerId);
			selectAnnotation(hit.id);
			engine.beginMove(hit, pt);
			return;
		}
		// 確定だけの空クリック: 新規作成は始めず、確定したテキストを選択して
		// 終わる (確定と新規作成が 1 クリックで同時に起きないようにする)
		if (wasEditing) {
			selectAnnotation(committed?.id ?? null);
			return;
		}
		// 空クリック: 選択解除 + 入力開始候補 (ただし Space 押下中は開始しない)
		selectAnnotation(null);
		if (spacePressedRef.current) return;
		dragRef.current = {
			kind: "pending-create",
			pointerId: e.pointerId,
			createPt: pt,
			startClient: { x: e.clientX, y: e.clientY },
		};
		e.currentTarget.setPointerCapture(e.pointerId);
	};

	const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const d = dragRef.current;
		if (!d || d.pointerId !== e.pointerId) return;
		if (d.kind === "move") {
			const pt = getImagePoint(e.clientX, e.clientY);
			if (!pt) return;
			engine.updateInteraction(pt);
			return;
		}
		if (d.kind === "pending-create") {
			const dist = Math.hypot(
				e.clientX - d.startClient.x,
				e.clientY - d.startClient.y,
			);
			if (dist > CLICK_SLOP_PX) {
				// 動きすぎたらクリック扱いをやめる (テキストはドラッグ描画しない)
				dragRef.current = { kind: "cancelled", pointerId: d.pointerId };
			}
		}
	};

	const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
		const d = dragRef.current;
		if (!d || d.pointerId !== e.pointerId) return;
		dragRef.current = null;
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			// already released
		}
		if (d.kind === "move") {
			engine.endInteraction();
		} else if (d.kind === "pending-create") {
			engine.beginCreate(d.createPt);
		}
	};

	return (
		<div
			className="absolute inset-0"
			onPointerCancel={onPointerUp}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			style={{
				cursor: "text",
				touchAction: "none",
			}}
		/>
	);
}
