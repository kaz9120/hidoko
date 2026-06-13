import { HighlightShape } from "~/components/canvas/highlight-layer";
import type { HighlightDefaults } from "~/lib/highlight-engine";

type PreviewHighlight = { x1: number; y1: number; x2: number; y2: number };

type HighlightPreviewOverlayProps = {
	previewHighlight: PreviewHighlight;
	imageWidth: number;
	imageHeight: number;
	defaults: HighlightDefaults;
};

/**
 * 描画中のハイライト (まだ commit されていない) をプレビュー表示する。
 * 帯は半透明 + multiply が本来の見た目なので、矢印のような破線化はせず
 * 確定後と同じ描画 (HighlightShape) をそのまま先取りする。色・不透明度・
 * 太さは現在の highlightDefaults を反映する。pointer-events は通さない。
 */
export function HighlightPreviewOverlay({
	previewHighlight,
	imageWidth,
	imageHeight,
	defaults,
}: HighlightPreviewOverlayProps) {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 size-full"
			preserveAspectRatio="none"
			viewBox={`0 0 ${imageWidth} ${imageHeight}`}
		>
			<HighlightShape
				highlight={{
					id: "__preview__",
					kind: "highlight",
					x1: previewHighlight.x1,
					y1: previewHighlight.y1,
					x2: previewHighlight.x2,
					y2: previewHighlight.y2,
					color: defaults.color,
					opacity: defaults.opacity,
					thickness: defaults.thickness,
					strokeStyle: defaults.strokeStyle,
					// プレビュー専用なので seed は固定でよい (ドラッグ中、線分の長さ
					// が変わるたびに揺らぎの「種」だけ変わると見た目が不安定になる)。
					// commit 後は new seed が採番される。
					seed: 0,
					createdAt: 0,
					zIndex: 0,
				}}
			/>
		</svg>
	);
}
