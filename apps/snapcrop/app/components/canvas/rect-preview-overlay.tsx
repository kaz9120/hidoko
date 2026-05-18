import { OUTLINE_PX, type RectThickness } from "~/lib/rect-engine";

type PreviewRect = { x: number; y: number; width: number; height: number };

type RectPreviewOverlayProps = {
	previewRect: PreviewRect;
	imageWidth: number;
	imageHeight: number;
	color: string;
	thickness: RectThickness;
};

/**
 * 描画中の矩形 (まだ commit されていない) をプレビュー表示する。SVG ベース、
 * 破線で「未確定」を示す。pointer-events は通さない。
 */
export function RectPreviewOverlay({
	previewRect,
	imageWidth,
	imageHeight,
	color,
	thickness,
}: RectPreviewOverlayProps) {
	const sw = OUTLINE_PX[thickness];
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 size-full"
			preserveAspectRatio="none"
			viewBox={`0 0 ${imageWidth} ${imageHeight}`}
		>
			<rect
				fill="none"
				height={previewRect.height}
				rx={1}
				stroke={color}
				strokeDasharray={`${sw * 3} ${sw * 2}`}
				strokeWidth={sw}
				width={previewRect.width}
				x={previewRect.x}
				y={previewRect.y}
			/>
		</svg>
	);
}
