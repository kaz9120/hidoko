import type { Fields, TemplateDef } from "~/lib/og-templates";
import {
	FRAME_HEIGHT,
	FRAME_WIDTH,
	TIMELINE_CARD_WIDTH,
	TIMELINE_SCALE,
} from "~/lib/readability";

/**
 * note タイムライン実寸相当の縮小プレビュー。メインプレビューと同じテンプレ
 * 描画を 343px 幅（モバイルのタイムラインでカード画像が占める幅）に縮小する。
 *
 * 可読性の警告（フォントサイズ閾値割れ / コントラスト低め）は #134 で
 * StatusBar に一本化されたので、ここでは表示しない (#139)。
 *
 * @param titleFontSize 互換のため受け取るが、現状の描画では使わない。
 */
export function TimelinePreview({
	tpl,
	fields,
}: {
	tpl: TemplateDef;
	fields: Fields;
	/** 旧 API 互換のため受け取る。現状の描画では使用しない。 */
	titleFontSize?: number | null;
}) {
	const Comp = tpl.Comp;
	const cardHeight = Math.round(
		TIMELINE_CARD_WIDTH * (FRAME_HEIGHT / FRAME_WIDTH),
	);

	return (
		<div
			className="flex max-w-full flex-shrink-0 flex-col items-center gap-2"
			style={{ width: TIMELINE_CARD_WIDTH }}
		>
			<div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
				タイムライン実寸　·　{TIMELINE_CARD_WIDTH}px
			</div>
			<div
				aria-hidden="true"
				className="overflow-hidden rounded-[3px]"
				style={{
					width: TIMELINE_CARD_WIDTH,
					height: cardHeight,
					boxShadow: "0 0 0 1px var(--border)",
				}}
			>
				<div
					style={{
						width: FRAME_WIDTH,
						height: FRAME_HEIGHT,
						transform: `scale(${TIMELINE_SCALE})`,
						transformOrigin: "top left",
					}}
				>
					<Comp f={fields} />
				</div>
			</div>
		</div>
	);
}
