import {
	getHighlightRenderModel,
	type HighlightAnnotation,
} from "~/lib/highlight-engine";

type HighlightLayerProps = {
	highlights: readonly HighlightAnnotation[];
	imageWidth: number;
	imageHeight: number;
};

/**
 * マーカーアノテーションを SVG で重ね描きする。arrow-layer.tsx と同じく
 * viewBox を画像座標 (= naturalWidth × naturalHeight) で張り、stroke-width を
 * 画像 px のまま指定する。pointer-events は通さない (hit は
 * AnnotationInteractionLayer 側で取る)。
 *
 * 蛍光ペンの重ね味 (下の文字が透ける) は、各帯ごとの
 * `mix-blend-mode: multiply` + stroke-opacity で出す。createdAt 順に
 * 1 本ずつ下のピクセルと multiply 合成されるので、canvas エクスポート
 * (globalCompositeOperation = "multiply" の逐次描画) と同じ見た目になる。
 */
export function HighlightLayer({
	highlights,
	imageWidth,
	imageHeight,
}: HighlightLayerProps) {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 size-full"
			preserveAspectRatio="none"
			viewBox={`0 0 ${imageWidth} ${imageHeight}`}
		>
			{highlights.map((h) => (
				<HighlightShape highlight={h} key={h.id} />
			))}
		</svg>
	);
}

/**
 * マーカー 1 本ぶんの SVG 描画。線分 + 帯幅 (butt cap = ペン先の四角い端)。
 * 形状計算は highlight-engine の getHighlightRenderModel に集約していて、
 * canvas エクスポート (image-export) と同じ見た目になる。手書き風 (sketchy)
 * のときはモデルが返す揺らぎ済みパスを strokeWidth = bandWidth で描く。
 */
export function HighlightShape({
	highlight,
}: {
	highlight: HighlightAnnotation;
}) {
	const model = getHighlightRenderModel(highlight);
	if (model.sketchy) {
		return (
			<g style={{ mixBlendMode: "multiply" }}>
				{model.sketchy.linePaths.map((d) => (
					<path
						d={d}
						fill="none"
						key={d}
						stroke={model.color}
						strokeLinecap="butt"
						strokeOpacity={model.opacity}
						strokeWidth={model.bandWidth}
					/>
				))}
			</g>
		);
	}
	return (
		<line
			stroke={model.color}
			strokeLinecap="butt"
			strokeOpacity={model.opacity}
			strokeWidth={model.bandWidth}
			style={{ mixBlendMode: "multiply" }}
			x1={model.from.x}
			x2={model.to.x}
			y1={model.from.y}
			y2={model.to.y}
		/>
	);
}
