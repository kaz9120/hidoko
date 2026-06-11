import { type TextAnnotation, textHitBounds } from "~/lib/text-engine";

type Props = {
	text: TextAnnotation;
	zoom: number;
};

/**
 * 選択中のテキストに重ねる ember ring。rect-selection-overlay.tsx の 1px ring
 * と同じ見た目だが、テキストはリサイズハンドルを持たない (サイズはツールバー
 * のフォントサイズで変える) ので、全体が pointer-events:none。本体クリックは
 * 下のレイヤー (= AnnotationInteractionLayer) へ流れて move 開始に繋がる。
 */
export function TextSelectionOverlay({ text, zoom }: Props) {
	const b = textHitBounds(text);
	// 画面 px で 3px ぶん外側に逃がし、文字と ring が重ならないようにする
	const pad = 3;
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute"
			style={{
				left: b.x * zoom - pad,
				top: b.y * zoom - pad,
				width: b.width * zoom + pad * 2,
				height: b.height * zoom + pad * 2,
			}}
		>
			{/* selection ring — 1px ember-400 + dark shadow (写真上の視認性) */}
			<div className="pointer-events-none absolute inset-0 rounded-[3px] border border-[var(--ember-400)] shadow-[0_0_0_1px_rgba(0,0,0,0.45)]" />
		</div>
	);
}
