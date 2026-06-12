import { TriangleAlertIcon } from "lucide-react";
import type { Fields, TemplateDef } from "~/lib/og-templates";
import {
	CONTRAST_WARN_RATIO,
	FRAME_HEIGHT,
	FRAME_WIDTH,
	TIMELINE_CARD_WIDTH,
	TIMELINE_SCALE,
	TITLE_FONT_WARN_PX,
	titleContrast,
} from "~/lib/readability";

/**
 * note タイムライン実寸相当の縮小プレビューと、可読性の警告。
 *
 * メインプレビューと同じテンプレ描画を 343px 幅（モバイルのタイムラインで
 * カード画像が占める幅）に縮小して常時表示する。編集中の fields をそのまま
 * 受けるので、リアルタイムに追従する。
 *
 * 警告は 2 種類。どちらも自動では直さず、まず知らせる。
 * - タイトルの確定フォントサイズが閾値未満（タイムラインで 10px を割る）
 * - タイトル文字色×背景のコントラスト比が 4.5:1 未満（写真全面は対象外）
 */
export function TimelinePreview({
	tpl,
	fields,
	titleFontSize,
}: {
	tpl: TemplateDef;
	fields: Fields;
	/** AutoFitTitle が確定したフォントサイズ（1280px 基準）。未確定なら null */
	titleFontSize: number | null;
}) {
	const Comp = tpl.Comp;
	const cardHeight = Math.round(
		TIMELINE_CARD_WIDTH * (FRAME_HEIGHT / FRAME_WIDTH),
	);

	const warnings: string[] = [];
	if (
		fields.title &&
		titleFontSize !== null &&
		titleFontSize < TITLE_FONT_WARN_PX
	) {
		const onTimeline = Math.round(titleFontSize * TIMELINE_SCALE);
		warnings.push(
			`タイトルがタイムラインで約 ${onTimeline}px まで縮み、読めない可能性があります。改行位置を見直して 1 行を短くしてみてください`,
		);
	}
	const contrast = titleContrast(fields);
	if (contrast !== null && contrast < CONTRAST_WARN_RATIO) {
		warnings.push(
			`タイトル文字色と背景のコントラスト比が ${contrast.toFixed(1)}:1 と低めです。タイムラインで沈むので、パレットやテーマの変更を検討してください`,
		);
	}

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
			{warnings.length > 0 && (
				<ul className="flex w-full flex-col gap-1.5" role="status">
					{warnings.map((w) => (
						<li
							key={w}
							className="flex items-start gap-1.5 text-left text-xs leading-relaxed text-(--warning)"
						>
							<TriangleAlertIcon
								aria-hidden="true"
								className="mt-0.5 size-3.5 flex-shrink-0"
								strokeWidth={1.75}
							/>
							{w}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
