import {
	getTextRenderModel,
	TEXT_FONT_STACKS,
	type TextAlign,
	type TextAnnotation,
	textBackgroundColor,
} from "~/lib/text-engine";

const TEXT_ANCHORS: Record<TextAlign, "start" | "middle" | "end"> = {
	left: "start",
	center: "middle",
	right: "end",
};

type TextLayerProps = {
	texts: readonly TextAnnotation[];
	imageWidth: number;
	imageHeight: number;
	/** インライン編集中のテキスト id。編集 UI と二重に見えないよう描画から外す */
	editingId?: string | null;
};

/**
 * テキストアノテーションを SVG で重ね描きする。arrow-layer.tsx と同じく
 * viewBox を画像座標 (= naturalWidth × naturalHeight) で張り、font-size を
 * 画像 px のまま指定する。pointer-events は通さない (hit は
 * TextInteractionLayer 側で取る)。
 */
export function TextLayer({
	texts,
	imageWidth,
	imageHeight,
	editingId = null,
}: TextLayerProps) {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 size-full"
			preserveAspectRatio="none"
			viewBox={`0 0 ${imageWidth} ${imageHeight}`}
		>
			{texts
				.filter((t) => t.id !== editingId)
				.map((t) => (
					<TextShape key={t.id} text={t} />
				))}
		</svg>
	);
}

/**
 * テキスト 1 つぶんの SVG 描画。背景矩形 (なし / 白 / 黒) + 行ごとの <text>。
 * baseline・行送り・アンカーの計算は text-engine の getTextRenderModel に
 * 集約していて、canvas エクスポート (image-export) と同じ見た目になる。
 */
export function TextShape({ text }: { text: TextAnnotation }) {
	const model = getTextRenderModel(text);
	const bg = textBackgroundColor(text.background);
	return (
		<g>
			{model.bgRect && bg && (
				<rect
					fill={bg}
					height={model.bgRect.height}
					rx={model.bgRect.radius}
					width={model.bgRect.width}
					x={model.bgRect.x}
					y={model.bgRect.y}
				/>
			)}
			{model.lines.map((line, i) => (
				<text
					fill={text.color}
					fontFamily={TEXT_FONT_STACKS[text.fontFamily]}
					fontSize={text.fontSize}
					fontStyle={text.italic ? "italic" : undefined}
					fontWeight={text.bold ? 700 : 400}
					// biome-ignore lint/suspicious/noArrayIndexKey: 行は text 由来で順序固定
					key={i}
					textAnchor={TEXT_ANCHORS[text.align]}
					x={line.x}
					y={line.baselineY}
				>
					{line.text}
				</text>
			))}
		</g>
	);
}
