import { type ArrowAnnotation, getArrowRenderModel } from "~/lib/arrow-engine";

type ArrowLayerProps = {
	arrows: readonly ArrowAnnotation[];
	imageWidth: number;
	imageHeight: number;
};

/**
 * 矢印アノテーションを SVG で重ね描きする。annotation-layer.tsx (rect) と同じく
 * viewBox を画像座標 (= naturalWidth × naturalHeight) で張り、stroke-width を
 * 画像 px のまま指定する。pointer-events は通さない (hit は
 * ArrowInteractionLayer 側で取る)。
 */
export function ArrowLayer({
	arrows,
	imageWidth,
	imageHeight,
}: ArrowLayerProps) {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 size-full"
			preserveAspectRatio="none"
			viewBox={`0 0 ${imageWidth} ${imageHeight}`}
		>
			{arrows.map((a) => (
				<ArrowShape arrow={a} key={a.id} />
			))}
		</svg>
	);
}

/**
 * 矢印 1 本ぶんの SVG 描画。線 (直線 or quadratic bezier) + 端点キャップ
 * (矢頭 / 丸)。dashed は描画中プレビュー (arrow-preview-overlay) が使う。
 * 形状計算は arrow-engine の getArrowRenderModel に集約していて、canvas
 * エクスポート (image-export) と同じ見た目になる。
 */
export function ArrowShape({
	arrow,
	dashed = false,
}: {
	arrow: ArrowAnnotation;
	dashed?: boolean;
}) {
	const model = getArrowRenderModel(arrow);
	const d = model.control
		? `M ${model.from.x} ${model.from.y} Q ${model.control.x} ${model.control.y} ${model.to.x} ${model.to.y}`
		: `M ${model.from.x} ${model.from.y} L ${model.to.x} ${model.to.y}`;
	return (
		<g>
			<path
				d={d}
				fill="none"
				stroke={arrow.color}
				strokeDasharray={
					dashed
						? `${model.strokeWidth * 3} ${model.strokeWidth * 2}`
						: undefined
				}
				strokeLinecap="round"
				strokeWidth={model.strokeWidth}
			/>
			{model.caps.map((cap, i) =>
				cap.type === "arrowhead" ? (
					<path
						d={`M ${cap.points[0].x} ${cap.points[0].y} L ${cap.points[1].x} ${cap.points[1].y} L ${cap.points[2].x} ${cap.points[2].y} Z`}
						fill={arrow.color}
						// biome-ignore lint/suspicious/noArrayIndexKey: caps は最大 2 個で順序固定 (start, end)
						key={i}
					/>
				) : (
					<circle
						cx={cap.center.x}
						cy={cap.center.y}
						fill={arrow.color}
						// biome-ignore lint/suspicious/noArrayIndexKey: caps は最大 2 個で順序固定 (start, end)
						key={i}
						r={cap.radius}
					/>
				),
			)}
		</g>
	);
}
