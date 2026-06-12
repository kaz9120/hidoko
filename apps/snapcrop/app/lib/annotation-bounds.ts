import type { AnnotationHit } from "~/lib/annotation-hit-test";
import { HIGHLIGHT_BAND_PX } from "~/lib/highlight-engine";
import { textHitBounds } from "~/lib/text-engine";

export type Rect = { x: number; y: number; width: number; height: number };

/**
 * 種別を問わない注釈の外接矩形 (画像 px)。ミニアクションバーの配置基準に
 * 使う。矢印は両端点の bbox (キャップの張り出しまでは追わない)、マーカーは
 * 端点 bbox を帯の半幅ぶん広げる、テキストは hit test と同じ外接矩形。
 */
export function annotationBounds(a: AnnotationHit): Rect {
	switch (a.kind) {
		case "rect":
			return { x: a.x, y: a.y, width: a.width, height: a.height };
		case "arrow": {
			const x = Math.min(a.x1, a.x2);
			const y = Math.min(a.y1, a.y2);
			return {
				x,
				y,
				width: Math.abs(a.x2 - a.x1),
				height: Math.abs(a.y2 - a.y1),
			};
		}
		case "text":
			return textHitBounds(a);
		case "highlight": {
			const half = HIGHLIGHT_BAND_PX[a.thickness] / 2;
			const x = Math.min(a.x1, a.x2) - half;
			const y = Math.min(a.y1, a.y2) - half;
			return {
				x,
				y,
				width: Math.abs(a.x2 - a.x1) + half * 2,
				height: Math.abs(a.y2 - a.y1) + half * 2,
			};
		}
	}
}
