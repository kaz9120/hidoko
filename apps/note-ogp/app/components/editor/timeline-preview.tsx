import type { Fields } from "~/lib/og-templates";
import { Cover, FRAME_HEIGHT, FRAME_WIDTH } from "~/lib/og-templates";

/**
 * note タイムライン実寸相当の縮小プレビュー。Cover v3 を 343px 幅
 * （モバイルのタイムラインでカード画像が占める幅）に縮小する。
 */
const TIMELINE_CARD_WIDTH = 343;
const TIMELINE_SCALE = TIMELINE_CARD_WIDTH / FRAME_WIDTH;

export function TimelinePreview({ fields }: { fields: Fields }) {
	const cardHeight = Math.round(
		TIMELINE_CARD_WIDTH * (FRAME_HEIGHT / FRAME_WIDTH),
	);

	return (
		<div
			className="flex max-w-full flex-shrink-0 flex-col items-center gap-2"
			style={{ width: TIMELINE_CARD_WIDTH }}
		>
			<div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
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
					<Cover f={fields} />
				</div>
			</div>
		</div>
	);
}
