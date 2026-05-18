import {
	FILL_OPACITY,
	OUTLINE_PX,
	type RectAnnotation,
} from "~/lib/rect-engine";

type AnnotationLayerProps = {
	annotations: readonly RectAnnotation[];
	imageWidth: number;
	imageHeight: number;
};

/**
 * outline / fill の rect を SVG で重ね描きする。mosaic は別レイヤー (mosaic-layer)
 * で扱うのでここでは filter out する。pointer-events は通さない (hit は
 * RectInteractionLayer 側で取る)。
 *
 * viewBox を画像座標 (= naturalWidth × naturalHeight) で張るので、stroke-width
 * や rx をそのまま画像 px で指定できる。display は CSS の width:100% で zoom に
 * 追従する。
 */
export function AnnotationLayer({
	annotations,
	imageWidth,
	imageHeight,
}: AnnotationLayerProps) {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 size-full"
			preserveAspectRatio="none"
			viewBox={`0 0 ${imageWidth} ${imageHeight}`}
		>
			{annotations.map((a) => {
				if (a.style === "mosaic") return null;
				if (a.style === "fill") {
					return (
						<rect
							fill={a.color}
							fillOpacity={FILL_OPACITY}
							height={a.height}
							key={a.id}
							rx={2}
							width={a.width}
							x={a.x}
							y={a.y}
						/>
					);
				}
				return (
					<rect
						fill="none"
						height={a.height}
						key={a.id}
						rx={1}
						stroke={a.color}
						strokeWidth={OUTLINE_PX[a.thickness]}
						width={a.width}
						x={a.x}
						y={a.y}
					/>
				);
			})}
		</svg>
	);
}
