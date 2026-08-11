import { FRAME_WIDTH } from "~/lib/og-templates";

/**
 * タイトルが note のタイムラインで読める大きさかを判定する。
 *
 * 台紙は 1280px 幅で組むが、読み手が最初に見るのはタイムラインのカード
 * （モバイルで 343px）。ここで潰れると、どれだけ台紙が整っていても伝わらない。
 * 判定はステータスバーとタイトル入力の両方が使うので、閾値と文言をここに置く。
 */

const TIMELINE_CARD_WIDTH = 343;
const TIMELINE_SCALE = TIMELINE_CARD_WIDTH / FRAME_WIDTH;
/** タイムライン実寸でこれを下回ると読めない */
const MIN_READABLE_PX = 10;
const WARN_BELOW_PX = Math.ceil(MIN_READABLE_PX / TIMELINE_SCALE);

export type TitleReadability = {
	level: "ok" | "warn" | "bad";
	/** タイムライン実寸に落としたときの字の大きさ（px）。未計測なら null */
	onTimeline: number | null;
	/** そのまま画面に出せる 1 行 */
	message: string;
};

/**
 * @param titleFontSize FitV10 が確定したフォントサイズ（1280px 基準）。
 *   未計測なら null
 */
export function getTitleReadability(
	titleFontSize: number | null,
): TitleReadability {
	if (titleFontSize === null || titleFontSize >= WARN_BELOW_PX) {
		return { level: "ok", onTimeline: null, message: "タイムラインで読める" };
	}
	const onTimeline = Math.round(titleFontSize * TIMELINE_SCALE);
	return {
		level: onTimeline <= 8 ? "bad" : "warn",
		onTimeline,
		message: `タイムラインで${onTimeline}px。タイトルを短くする`,
	};
}
