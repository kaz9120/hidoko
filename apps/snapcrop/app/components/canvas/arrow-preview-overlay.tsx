import { ArrowShape } from "~/components/canvas/arrow-layer";
import type { ArrowDefaults } from "~/lib/arrow-engine";

type PreviewArrow = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	/** 手書き風の揺らぎ seed。commit 後の矢印と同じ形をプレビューする */
	seed: number;
};

type ArrowPreviewOverlayProps = {
	previewArrow: PreviewArrow;
	imageWidth: number;
	imageHeight: number;
	defaults: ArrowDefaults;
};

/**
 * 描画中の矢印 (まだ commit されていない) をプレビュー表示する。SVG ベース、
 * 破線で「未確定」を示す。線形・キャップ・色・太さは現在の arrowDefaults を
 * 反映するので、確定後の見た目をそのまま先取りできる。pointer-events は通さない。
 */
export function ArrowPreviewOverlay({
	previewArrow,
	imageWidth,
	imageHeight,
	defaults,
}: ArrowPreviewOverlayProps) {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 size-full"
			preserveAspectRatio="none"
			viewBox={`0 0 ${imageWidth} ${imageHeight}`}
		>
			<ArrowShape
				arrow={{
					id: "__preview__",
					kind: "arrow",
					x1: previewArrow.x1,
					y1: previewArrow.y1,
					x2: previewArrow.x2,
					y2: previewArrow.y2,
					line: defaults.line,
					startCap: defaults.startCap,
					endCap: defaults.endCap,
					color: defaults.color,
					thickness: defaults.thickness,
					style: defaults.style,
					seed: previewArrow.seed,
					createdAt: 0,
				}}
				dashed
			/>
		</svg>
	);
}
