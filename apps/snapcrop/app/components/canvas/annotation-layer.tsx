import {
	FILL_OPACITY,
	OUTLINE_PX,
	type RectAnnotation,
	sketchyRectStrokePaths,
} from "~/lib/rect-engine";

type AnnotationLayerProps = {
	annotations: readonly RectAnnotation[];
	imageWidth: number;
	imageHeight: number;
};

/**
 * outline / fill の rect を SVG で重ね描きする。mosaic は別レイヤー (mosaic-layer)
 * で扱うのでここでは filter out する。pointer-events は通さない (hit は
 * AnnotationInteractionLayer 側で取る)。
 *
 * viewBox を画像座標 (= naturalWidth × naturalHeight) で張るので、stroke-width
 * や rx をそのまま画像 px で指定できる。display は CSS の width:100% で zoom に
 * 追従する。outline + sketchy は arrow-layer と同じく揺らぎ済みパスを描く
 * (fill / mosaic は枠線がないので strokeStyle は無視する)。
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
				if (a.strokeStyle === "sketchy") {
					const strokeWidth = OUTLINE_PX[a.thickness];
					const paths = sketchyRectStrokePaths({
						x: a.x,
						y: a.y,
						width: a.width,
						height: a.height,
						seed: a.seed,
						strokeWidth,
					});
					return (
						<g key={a.id}>
							{paths.map((d) => (
								<path
									d={d}
									fill="none"
									key={d}
									stroke={a.color}
									strokeLinecap="round"
									strokeWidth={strokeWidth}
								/>
							))}
						</g>
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
