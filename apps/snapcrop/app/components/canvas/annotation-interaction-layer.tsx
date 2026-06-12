import type React from "react";
import { useRef } from "react";
import { type ActiveTool, useSnapcrop } from "~/contexts/snapcrop-context";
import type { UseArrowEngineResult } from "~/hooks/use-arrow-engine";
import type { UseHighlightEngineResult } from "~/hooks/use-highlight-engine";
import type { UseRectEngineResult } from "~/hooks/use-rect-engine";
import type { UseTextEngineResult } from "~/hooks/use-text-engine";
import {
	type AnnotationHit,
	hitTestAnnotations,
} from "~/lib/annotation-hit-test";
import type { ArrowAnnotation } from "~/lib/arrow-engine";
import type { HighlightAnnotation } from "~/lib/highlight-engine";
import type { RectAnnotation } from "~/lib/rect-engine";
import type { TextAnnotation } from "~/lib/text-engine";

/** これ以上動いたら「クリック」ではなく pan 等の誤爆とみなす画面 px 距離 */
const CLICK_SLOP_PX = 4;

/** crop を除いた描画系ツール。このレイヤーがマウントされる範囲。 */
export type DrawingTool = Exclude<ActiveTool, "crop">;

type ImagePoint = { x: number; y: number };

type Drag =
	| { kind: "move"; tool: DrawingTool; pointerId: number }
	| { kind: "draw"; tool: "rect" | "arrow" | "highlight"; pointerId: number }
	| {
			kind: "pending-create";
			pointerId: number;
			createPt: ImagePoint;
			startClient: { x: number; y: number };
	  }
	| { kind: "cancelled"; pointerId: number };

type Props = {
	activeTool: DrawingTool;
	rectEngine: UseRectEngineResult;
	arrowEngine: UseArrowEngineResult;
	textEngine: UseTextEngineResult;
	highlightEngine: UseHighlightEngineResult;
	annotations: readonly RectAnnotation[];
	arrows: readonly ArrowAnnotation[];
	texts: readonly TextAnnotation[];
	highlights: readonly HighlightAnnotation[];
	zoom: number;
	getImagePoint: (
		clientX: number,
		clientY: number,
	) => { x: number; y: number } | null;
};

/**
 * 描画系ツール (rect / arrow / text / highlight) 選択中に stage を覆う透明な
 * hit layer。従来はツールごとに別レイヤーで自種別しか hit test していなかった
 * のを 1 枚に統合し、pointerdown で全種別横断の hit test (#103) を行う。
 *
 * - 既存注釈にヒットしたら、activeTool をその種別へ追従させてから選択 + 移動
 *   開始する。追従させることでツールバー・選択ハンドル・ショートカットが
 *   既存の「選択種別 = activeTool」の整合のまま機能する。レイヤー自体は
 *   描画系ツール間で共通なので、追従でツールが切り替わってもマウントは
 *   維持され、pointer capture が切れない。
 * - Alt を押しながら既存注釈を掴むと、移動ではなく複製してからドラッグする
 *   (#104)。コピーは各 engine の duplicating interaction が pointerup で
 *   commit するため、複製は undo 1 回で取り消せる。
 * - 空クリック / 空ドラッグは従来どおり activeTool の新規作成になる
 *   (rect / arrow / highlight はドラッグ描画、text はクリックで入力開始)。
 * - テキストのインライン編集中の pointerdown は、blur 任せにせず
 *   engine.flushEdit() で先に編集を確定してから通常の hit test に流す
 *   (issue #80 の挙動を維持)。既存テキストのダブルクリック (e.detail >= 2)
 *   は移動ではなく再編集を開始する。
 *
 * 座標変換は親 (image-stage) から `getImagePoint` を受け取る — 親で画像要素を
 * 起点に算出することで、selection overlay の handle と同じ基準座標を共有できる。
 */
export function AnnotationInteractionLayer({
	activeTool,
	rectEngine,
	arrowEngine,
	textEngine,
	highlightEngine,
	annotations,
	arrows,
	texts,
	highlights,
	zoom,
	getImagePoint,
}: Props) {
	const { selectAnnotation, setActiveTool, spacePressedRef } = useSnapcrop();
	const dragRef = useRef<Drag | null>(null);

	const beginDuplicate = (hit: AnnotationHit, pt: ImagePoint) => {
		switch (hit.kind) {
			case "rect":
				rectEngine.beginDuplicate(hit, pt);
				return;
			case "arrow":
				arrowEngine.beginDuplicate(hit, pt);
				return;
			case "highlight":
				highlightEngine.beginDuplicate(hit, pt);
				return;
			case "text":
				textEngine.beginDuplicate(hit, pt);
				return;
		}
	};

	const beginMove = (hit: AnnotationHit, pt: ImagePoint) => {
		switch (hit.kind) {
			case "rect":
				rectEngine.beginMove(hit.id, pt);
				return;
			case "arrow":
				arrowEngine.beginMove(hit.id, pt);
				return;
			case "highlight":
				highlightEngine.beginMove(hit.id, pt);
				return;
			case "text":
				// text だけ id でなく実体を渡す — インライン編集の確定直後は
				// context 反映前の committed を動かす必要があるため
				textEngine.beginMove(hit, pt);
				return;
		}
	};

	const updateMove = (
		tool: DrawingTool,
		pt: ImagePoint,
		constrain: boolean,
	) => {
		switch (tool) {
			case "rect":
				rectEngine.updateInteraction(pt, constrain);
				return;
			case "arrow":
				arrowEngine.updateInteraction(pt, constrain);
				return;
			case "highlight":
				highlightEngine.updateInteraction(pt, constrain);
				return;
			case "text":
				textEngine.updateInteraction(pt);
				return;
		}
	};

	const endMove = (tool: DrawingTool) => {
		switch (tool) {
			case "rect":
				rectEngine.endInteraction();
				return;
			case "arrow":
				arrowEngine.endInteraction();
				return;
			case "highlight":
				highlightEngine.endInteraction();
				return;
			case "text":
				textEngine.endInteraction();
				return;
		}
	};

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		const pt = getImagePoint(e.clientX, e.clientY);
		if (!pt) return;
		// 編集中のクリックはここで即時 commit し、同じジェスチャを下の hit test
		// に流す。textarea 自体へのクリックはこのレイヤーに届かない (caret 移動
		// のまま) ので、ここに来るのは「外側」だけ。
		const wasEditing = textEngine.editing !== null;
		const committed = wasEditing ? textEngine.flushEdit() : null;
		e.preventDefault();
		// commit 直後のテキストは context 反映前なので、hit 対象を差し替える
		const hitTexts = committed
			? [...texts.filter((t) => t.id !== committed.id), committed]
			: texts;
		const hit = hitTestAnnotations(
			{ annotations, arrows, texts: hitTexts, highlights },
			pt.x,
			pt.y,
			zoom,
		);
		if (hit) {
			// どのツール中でも掴める。activeTool を種別へ追従させてから選択する
			// (SET_ACTIVE_TOOL の pruneSelection は旧選択にだけ効く順序)
			setActiveTool(hit.kind);
			// Alt+ドラッグは移動でなく複製してからドラッグ (Excalidraw / Figma の
			// 慣例)。コピーは pointerup まで context に入らないため、ドラッグ中は
			// 選択を外しておき、commit 時の自動選択でコピー側が選択される。
			if (e.altKey) {
				selectAnnotation(null);
				dragRef.current = {
					kind: "move",
					tool: hit.kind,
					pointerId: e.pointerId,
				};
				e.currentTarget.setPointerCapture(e.pointerId);
				beginDuplicate(hit, pt);
				return;
			}
			selectAnnotation(hit.id);
			// テキストのダブルクリック (連打 2 回目) は移動ではなく再編集を開始する
			if (hit.kind === "text" && e.detail >= 2) {
				textEngine.beginEdit(hit.id);
				return;
			}
			dragRef.current = {
				kind: "move",
				tool: hit.kind,
				pointerId: e.pointerId,
			};
			e.currentTarget.setPointerCapture(e.pointerId);
			beginMove(hit, pt);
			return;
		}
		// 確定だけの空クリック: 新規作成は始めず、確定したテキストを選択して
		// 終わる (確定と新規作成が 1 クリックで同時に起きないようにする)
		if (wasEditing) {
			selectAnnotation(committed?.id ?? null);
			return;
		}
		// 空クリック: 選択解除 + activeTool の新規作成開始。Space 押下中は
		// viewport が pointer-events を止めて pan するためここには届かないが、
		// 解除直後の取りこぼしに備えて作成開始だけは抑制する。
		selectAnnotation(null);
		if (spacePressedRef.current) return;
		if (activeTool === "text") {
			// テキストはドラッグ描画しない。クリック (= 動かさず pointerup) で
			// その位置から入力を開始する
			dragRef.current = {
				kind: "pending-create",
				pointerId: e.pointerId,
				createPt: pt,
				startClient: { x: e.clientX, y: e.clientY },
			};
			e.currentTarget.setPointerCapture(e.pointerId);
			return;
		}
		dragRef.current = {
			kind: "draw",
			tool: activeTool,
			pointerId: e.pointerId,
		};
		e.currentTarget.setPointerCapture(e.pointerId);
		switch (activeTool) {
			case "rect":
				rectEngine.beginDraw(pt, e.shiftKey);
				return;
			case "arrow":
				arrowEngine.beginDraw(pt, e.shiftKey);
				return;
			case "highlight":
				highlightEngine.beginDraw(pt, e.shiftKey);
				return;
		}
	};

	const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const d = dragRef.current;
		if (!d || d.pointerId !== e.pointerId) return;
		if (d.kind === "move" || d.kind === "draw") {
			const pt = getImagePoint(e.clientX, e.clientY);
			if (!pt) return;
			// shiftKey で拘束 (正方形 / 角度スナップ / 水平垂直)。途中の押下・
			// 解放にもそのまま追従する
			updateMove(d.tool, pt, e.shiftKey);
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
		if (d.kind === "move" || d.kind === "draw") {
			endMove(d.tool);
		} else if (d.kind === "pending-create") {
			textEngine.beginCreate(d.createPt);
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
				cursor: activeTool === "text" ? "text" : "crosshair",
				touchAction: "none",
			}}
		/>
	);
}
