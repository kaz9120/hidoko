import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";
import { useDocumentFontsReady } from "~/hooks/use-document-fonts-ready";
import {
	type ImageStats,
	pickQuietRegion,
	type QuietRegionId,
	type Region,
	regionMean,
	useImageStats,
} from "./image-stats";
import { kanjiNumber } from "./kanji-number";
import { TSUME, type TsumeLevel, tsumeSpans } from "./tsume";
import type { Fields, KumiId, Milestone } from "./types";

// note-ogp v10 — 写真フルブリードを土台に固定し、号ごとに選ぶのは「組み」だけ。
// 組みは「タイトルの居場所」と「号数の身振り」をセットにした名前付きレイアウトで、
// 12 種ある。文字色・スクリム・ハロは写真の輝度から自動で決まる。

const V10 = {
	/** 暗い面・スクリムの上に置く文字。純白は使わない */
	ink: "#f5f1e6",
	ember: "#f47d3a",
	emberSoft: "#f8a05c",
	/** 台紙の地。写真が無いときはフォールバックのグラデーションが乗る */
	base: "#0a0907",
	jpSerif: "'Shippori Mincho', serif",
	serif: "'Newsreader', 'Shippori Mincho', serif",
	mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const FRAME_WIDTH = 1280;
export const FRAME_HEIGHT = 670;

const FRAME: CSSProperties = {
	width: FRAME_WIDTH,
	height: FRAME_HEIGHT,
	position: "relative",
	overflow: "hidden",
	WebkitFontSmoothing: "antialiased",
	background: V10.base,
};

// 詰めは常にポスター詰め。組み以外の意匠をユーザーに選ばせないため固定する。
const TSUME_LEVEL: TsumeLevel = "poster";

// ─────────────────────────────────────────────────────────
// 自動インク計画
//   タイトル領域の平均輝度で 3 分岐する。暗ければそのまま、中間調なら
//   スクリムを敷き、明るければハロ（黒淵の白）で文字を浮かせる。
//   ユーザー操作は「スクリム: 自動 / 強制」の 2 択だけ。
// ─────────────────────────────────────────────────────────
const HALO =
	"0 1px 3px rgba(10,9,7,0.55), 0 3px 12px rgba(10,9,7,0.4), 0 10px 38px rgba(10,9,7,0.32)";
const HALO_SM = "0 1px 2px rgba(10,9,7,0.5), 0 2px 10px rgba(10,9,7,0.35)";

type InkPlan = {
	ink: string;
	scrim: boolean;
	/** タイトル用のハロ。明るい面のときだけ入る */
	shadow?: string;
	/** 号数など小物用のハロ */
	msShadow?: string;
};

function inkPlan(mean: number, forceScrim: boolean): InkPlan {
	if (forceScrim) return { ink: V10.ink, scrim: true };
	if (mean < 0.45) return { ink: V10.ink, scrim: false };
	if (mean < 0.62) return { ink: V10.ink, scrim: true };
	return { ink: V10.ink, scrim: false, shadow: HALO, msShadow: HALO_SM };
}

// ─────────────────────────────────────────────────────────
// 背景：写真 + フィルムグレイン + 全面ビネット + 指向性スクリム
// ─────────────────────────────────────────────────────────
const GRAIN_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
	`<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5' stitchTiles='stitch'/>
    <feColorMatrix values='0 0 0 0 0.96  0 0 0 0 0.88  0 0 0 0 0.74  0 0 0 0.55 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#n)'/>
</svg>`,
)}`;

const FALLBACK_GRADIENT =
	"radial-gradient(ellipse 55% 45% at 32% 58%, #f47d3a 0%, #c64414 12%, #6b220c 28%, #2a0e04 55%, #0a0907 90%), linear-gradient(135deg, #1a0e08 0%, #050402 100%)";

/** スクリム（写真を暗くする面）の方向。組みが持ち、ユーザーは選ばない */
export type ScrimDirection =
	| "lb"
	| "rb"
	| "lt"
	| "rt"
	| "t"
	| "b"
	| "l"
	| "r"
	| "c"
	| "none";

const SCRIM_CSS: Record<ScrimDirection, string> = {
	lb: "linear-gradient(45deg, rgba(8,7,5,0.78) 0%, rgba(8,7,5,0.25) 38%, rgba(8,7,5,0) 60%)",
	rb: "linear-gradient(315deg, rgba(8,7,5,0.78) 0%, rgba(8,7,5,0.25) 38%, rgba(8,7,5,0) 60%)",
	lt: "linear-gradient(135deg, rgba(8,7,5,0.78) 0%, rgba(8,7,5,0.25) 38%, rgba(8,7,5,0) 60%)",
	rt: "linear-gradient(225deg, rgba(8,7,5,0.78) 0%, rgba(8,7,5,0.25) 38%, rgba(8,7,5,0) 60%)",
	b: "linear-gradient(0deg, rgba(8,7,5,0.82) 0%, rgba(8,7,5,0.32) 40%, rgba(8,7,5,0) 65%)",
	t: "linear-gradient(180deg, rgba(8,7,5,0.82) 0%, rgba(8,7,5,0.32) 40%, rgba(8,7,5,0) 65%)",
	l: "linear-gradient(90deg, rgba(8,7,5,0.82) 0%, rgba(8,7,5,0.32) 40%, rgba(8,7,5,0) 65%)",
	r: "linear-gradient(270deg, rgba(8,7,5,0.82) 0%, rgba(8,7,5,0.32) 40%, rgba(8,7,5,0) 65%)",
	c: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(8,7,5,0.65) 100%)",
	none: "transparent",
};

function PhotoBg({
	src,
	scrim,
}: {
	src: string | null;
	scrim: ScrimDirection;
}) {
	return (
		<div style={{ position: "absolute", inset: 0 }}>
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: FALLBACK_GRADIENT,
				}}
			/>
			{src && (
				<img
					src={src}
					alt=""
					crossOrigin="anonymous"
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						objectFit: "cover",
					}}
				/>
			)}
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage: `url("${GRAIN_DATA_URL}")`,
					backgroundSize: "320px 320px",
					opacity: 0.12,
					mixBlendMode: "overlay",
					pointerEvents: "none",
				}}
			/>
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					inset: 0,
					background:
						"radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, rgba(8,7,5,0.4) 100%)",
					pointerEvents: "none",
				}}
			/>
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					inset: 0,
					background: SCRIM_CSS[scrim],
					pointerEvents: "none",
				}}
			/>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// マーク（連載の背骨。位置・色・サイズは不動）
// ─────────────────────────────────────────────────────────
const HIDOKO_DOTS: Array<[number, number, number, number]> = [
	[26, 26, 3.37, 0.33],
	[44, 26, 4.41, 0.43],
	[98, 26, 4.41, 0.43],
	[116, 26, 3.37, 0.33],
	[8, 44, 3.04, 0.3],
	[26, 44, 4.59, 0.45],
	[44, 44, 5.92, 0.58],
	[62, 44, 6.78, 0.67],
	[80, 44, 6.78, 0.67],
	[98, 44, 5.92, 0.58],
	[116, 44, 4.59, 0.45],
	[134, 44, 3.04, 0.3],
	[8, 62, 3.66, 0.36],
	[26, 62, 5.41, 0.53],
	[44, 62, 7.08, 0.7],
	[62, 62, 8.45, 0.83],
	[80, 62, 8.45, 0.83],
	[98, 62, 7.08, 0.7],
	[116, 62, 5.41, 0.53],
	[134, 62, 3.66, 0.36],
	[26, 80, 5.62, 0.55],
	[44, 80, 7.42, 0.73],
	[62, 80, 9.19, 0.9],
	[80, 80, 9.19, 0.9],
	[98, 80, 7.42, 0.73],
	[116, 80, 5.62, 0.55],
	[26, 98, 5.14, 0.5],
	[44, 98, 6.68, 0.66],
	[62, 98, 7.81, 0.77],
	[80, 98, 7.81, 0.77],
	[98, 98, 6.68, 0.66],
	[116, 98, 5.14, 0.5],
	[44, 116, 5.34, 0.52],
	[62, 116, 6.08, 0.6],
	[80, 116, 6.08, 0.6],
	[98, 116, 5.34, 0.52],
	[62, 134, 4.3, 0.42],
	[80, 134, 4.3, 0.42],
];

export function HidokoMark({
	size = 22,
	color = V10.ember,
}: {
	size?: number;
	color?: string;
}) {
	const h = Math.round((size * 117) / 132);
	return (
		<svg
			viewBox="5 21 132 117"
			width={size}
			height={h}
			aria-hidden="true"
			style={{ display: "block" }}
		>
			<title>Hidoko mark</title>
			{HIDOKO_DOTS.map(([cx, cy, r, op]) => (
				<circle
					key={`${cx}-${cy}`}
					cx={cx}
					cy={cy}
					r={r}
					fill={color}
					opacity={op}
				/>
			))}
		</svg>
	);
}

// ─────────────────────────────────────────────────────────
// 組み 12 種の設計図
//   region は 0..1 の正規化座標。面積をほぼ揃えてあるので、居場所が
//   変わってもタイトルの見た目の大きさは揃う。
// ─────────────────────────────────────────────────────────
type TitleAlign = "left" | "right" | "center";

/** タイトルを流し込む矩形。v は縦方向の寄せ（既定は下寄せ） */
export type TitleRegion = Region & {
	align: TitleAlign;
	v?: "top" | "center";
};

export type Kumi = {
	name: string;
	/** null は自動配置（h1 静けさ）。写真の静かな面を探して決める */
	region: TitleRegion | null;
	/** "auto" は自動配置の結果から導く */
	scrim: ScrimDirection | "auto";
	/** フィットの上限フォントサイズ */
	max: number;
	vertical?: boolean;
};

export const KUMI: Record<KumiId, Kumi> = {
	a1: {
		name: "A1 定番",
		region: { x: 0.044, y: 0.5, w: 0.58, h: 0.34, align: "left" },
		scrim: "lb",
		max: 96,
	},
	b1: {
		name: "B1 見出し",
		region: {
			x: 0.044,
			y: 0.195,
			w: 0.912,
			h: 0.3,
			align: "left",
			v: "top",
		},
		scrim: "t",
		max: 80,
	},
	b7: {
		name: "B7 上段右",
		region: { x: 0.376, y: 0.155, w: 0.58, h: 0.34, align: "right", v: "top" },
		scrim: "rt",
		max: 88,
	},
	c1: {
		name: "C1 右柱",
		region: { x: 0.6, y: 0.11, w: 0.35, h: 0.78, align: "left" },
		scrim: "r",
		max: 88,
		vertical: true,
	},
	c11: {
		name: "C11 中柱・判上",
		region: { x: 0.36, y: 0.26, w: 0.28, h: 0.62, align: "center" },
		scrim: "c",
		max: 84,
		vertical: true,
	},
	d5: {
		name: "D5 扉",
		region: {
			x: 0.14,
			y: 0.28,
			w: 0.72,
			h: 0.34,
			align: "center",
			v: "center",
		},
		scrim: "c",
		max: 84,
	},
	d6: {
		name: "D6 中央大判",
		region: { x: 0.14, y: 0.38, w: 0.72, h: 0.3, align: "center", v: "center" },
		scrim: "c",
		max: 84,
	},
	e7: {
		name: "E7 重心外し",
		region: { x: 0.13, y: 0.34, w: 0.48, h: 0.34, align: "left", v: "center" },
		scrim: "l",
		max: 88,
	},
	f7: {
		name: "F7 浮き帯",
		region: { x: 0.06, y: 0.72, w: 0.6, h: 0.16, align: "left" },
		scrim: "none",
		max: 52,
	},
	g7: {
		name: "G7 目次風",
		region: { x: 0.044, y: 0.74, w: 0.55, h: 0.14, align: "left" },
		scrim: "b",
		max: 58,
	},
	g10: {
		name: "G10 対角巨大",
		region: { x: 0.044, y: 0.16, w: 0.55, h: 0.3, align: "left", v: "top" },
		scrim: "lt",
		max: 76,
	},
	h1: { name: "H1 静けさ", region: null, scrim: "auto", max: 88 },
};

/**
 * 節目号 3 変奏の表示名。通常の組みと別の族なので KUMI とは分けるが、
 * パネルのタイルとステータスバーからは同じように引ける形にしておく。
 */
export const MILESTONE_NAMES: Record<Milestone, string> = {
	watermark: "M1 透かし",
	hero: "M2 主役",
	kanji: "M4 漢数字",
};

// 自動配置で選ばれた面から、スクリムの方向を導く
const SCRIM_BY_PICK: Record<QuietRegionId, ScrimDirection> = {
	bl: "lb",
	br: "rb",
	tr: "rt",
	cl: "l",
	cr: "r",
	rcol: "r",
};

// ─────────────────────────────────────────────────────────
// 面積ベースのオートフィット
//   枠の「幅」ではなく面積に合わせる。禁則つきの自動折り返しを入れて
//   あるので、ユーザーが手で改行を入れる必要はない。
// ─────────────────────────────────────────────────────────
const WRAP: CSSProperties = {
	whiteSpace: "normal",
	lineBreak: "strict", // 禁則。行頭に読点や閉じ括弧が来ない
	wordBreak: "keep-all", // ラテン単語は割らない
	overflowWrap: "normal",
};
const NOWRAP: CSSProperties = { whiteSpace: "nowrap" };

const MIN_TITLE_SIZE = 30;

type Box = { w: number; h: number };

function FitV10({
	text,
	box,
	max,
	min = MIN_TITLE_SIZE,
	align,
	vertical,
	nowrap,
	style,
	onMeasured,
}: {
	text: string;
	box: Box;
	max: number;
	min?: number;
	align?: TitleAlign;
	vertical?: boolean;
	nowrap?: boolean;
	style?: CSSProperties;
	onMeasured?: (px: number) => void;
}) {
	const ref = useRef<HTMLDivElement | null>(null);
	const [size, setSize] = useState(max);
	const fontsReady = useDocumentFontsReady();

	// text は effect 内で直接読まないが、children として描画された結果を
	// scrollWidth / Height で測るので、変われば測り直す必要がある。fontsReady は
	// Web フォント読込後の書体メトリクスで再計測させるトリガ。
	// biome-ignore lint/correctness/useExhaustiveDependencies: text 変更時に DOM 再測定が必要
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		// 収まる最大サイズを二分探索する。14 回で 30〜96px の範囲は十分詰まる
		let lo = min;
		let hi = max;
		let best = min;
		for (let i = 0; i < 14 && lo <= hi; i++) {
			const mid = Math.floor((lo + hi) / 2);
			el.style.fontSize = `${mid}px`;
			const fits =
				el.scrollWidth <= Math.ceil(box.w) + 1 &&
				el.scrollHeight <= Math.ceil(box.h) + 1;
			if (fits) {
				best = mid;
				lo = mid + 1;
			} else {
				hi = mid - 1;
			}
		}
		el.style.fontSize = `${best}px`;
		setSize(best);
		onMeasured?.(best);
	}, [text, box.w, box.h, max, min, vertical, nowrap, fontsReady, onMeasured]);

	const boxStyle: CSSProperties = vertical
		? { height: box.h, maxWidth: box.w, writingMode: "vertical-rl" }
		: { width: box.w, textAlign: align ?? "left" };

	return (
		<div
			ref={ref}
			style={{
				...style,
				...boxStyle,
				...(nowrap ? NOWRAP : WRAP),
				fontSize: size,
			}}
		>
			{tsumeSpans(text, TSUME_LEVEL)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// マストヘッド（マークと名前を同じ段に。英文タグラインは付けない）
// ─────────────────────────────────────────────────────────
function Masthead({
	brand,
	showMark,
	ink,
	center,
	shadow,
}: {
	brand: string;
	showMark: boolean;
	ink: string;
	center?: boolean;
	shadow?: string;
}) {
	const pos: CSSProperties = center
		? { left: 0, right: 0, justifyContent: "center" }
		: { left: 52 };
	return (
		<div
			style={{
				position: "absolute",
				top: 44,
				display: "flex",
				alignItems: "center",
				gap: 14,
				...pos,
			}}
		>
			{showMark && <HidokoMark size={22} color={V10.ember} />}
			<span
				style={{
					fontFamily: V10.jpSerif,
					fontSize: 17,
					fontWeight: 600,
					letterSpacing: "0.14em",
					color: ink,
					lineHeight: 1,
					whiteSpace: "nowrap",
					textShadow: shadow,
				}}
			>
				{brand}
			</span>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// 号数の身振り 4 種
//   明るい面（plan.shadow がある）では、ハロを通したうえで小物の不透明度を
//   引き上げる。写真に負けて消えるのを防ぐため。
// ─────────────────────────────────────────────────────────
type NumberProps = {
	issue: string;
	date: string;
	ink: string;
	shadow?: string;
};

/**
 * 「VOL.」ラベルの見た目。組みが変えるのは字の大きさと字送りだけで、
 * 等幅・600・大きめのトラッキングという骨は号数の身振り全体で共通。
 */
function volLabelStyle({
	fontSize,
	letterSpacing,
	color,
	opacity,
}: {
	fontSize: number;
	letterSpacing: string;
	color: string;
	opacity: number;
}): CSSProperties {
	return {
		fontFamily: V10.mono,
		fontSize,
		fontWeight: 600,
		letterSpacing,
		color,
		opacity,
	};
}

/**
 * 号数そのものの見た目。Newsreader のイタリックで ember に置く。組みが変えるのは
 * 字の大きさと行送り、帯の中だけ淡い ember を使う。
 */
function issueNumberStyle({
	fontSize,
	lineHeight,
	color = V10.ember,
}: {
	fontSize: number;
	lineHeight: number;
	color?: string;
}): CSSProperties {
	return {
		fontFamily: V10.serif,
		fontStyle: "italic",
		fontSize,
		fontWeight: 500,
		color,
		lineHeight,
	};
}

function CornerNum({
	issue,
	date,
	ink,
	shadow,
	corner = "tr",
}: NumberProps & { corner?: "tr" | "bl" }) {
	const pos: CSSProperties =
		corner === "bl"
			? { left: 56, bottom: 44, textAlign: "left" }
			: { right: 56, top: 38, textAlign: "right" };
	return (
		<div style={{ position: "absolute", textShadow: shadow, ...pos }}>
			<div
				style={volLabelStyle({
					fontSize: 10,
					letterSpacing: "0.32em",
					color: ink,
					opacity: 0.65,
				})}
			>
				VOL.
			</div>
			<div style={issueNumberStyle({ fontSize: 34, lineHeight: 1.15 })}>
				{issue}
			</div>
			<div
				style={{
					fontFamily: V10.mono,
					fontSize: 10,
					letterSpacing: "0.24em",
					color: ink,
					opacity: 0.5,
				}}
			>
				{date}
			</div>
		</div>
	);
}

function PlateNum({ issue, date }: { issue: string; date: string }) {
	return (
		<div
			style={{
				position: "absolute",
				right: 44,
				bottom: 40,
				padding: "9px 14px",
				background: "rgba(10,9,7,0.55)",
				display: "flex",
				alignItems: "baseline",
				gap: 10,
			}}
		>
			<span
				style={{
					fontFamily: V10.serif,
					fontStyle: "italic",
					fontSize: 24,
					color: V10.emberSoft,
					lineHeight: 1,
				}}
			>
				{issue}
			</span>
			<span
				style={{
					fontFamily: V10.mono,
					fontSize: 10,
					letterSpacing: "0.24em",
					color: V10.ink,
					opacity: 0.7,
				}}
			>
				{date}
			</span>
		</div>
	);
}

function Film({
	issue,
	date,
	ink,
	shadow,
	side,
}: NumberProps & { side: "left" | "right" }) {
	const bar: CSSProperties = {
		width: 1,
		flex: 1,
		background: V10.ember,
		opacity: shadow ? 0.7 : 0.42,
		boxShadow: shadow ? "0 0 6px rgba(10,9,7,0.5)" : "none",
	};
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				bottom: 0,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 18,
				...(side === "left" ? { left: 26 } : { right: 26 }),
			}}
		>
			<span style={bar} />
			<span
				style={{
					writingMode: "vertical-rl",
					fontFamily: V10.mono,
					fontSize: 13,
					letterSpacing: "0.4em",
					color: V10.ember,
					fontWeight: 600,
					textShadow: shadow,
				}}
			>
				VOL.{issue}
			</span>
			<span
				style={{
					writingMode: "vertical-rl",
					fontFamily: V10.mono,
					fontSize: 11,
					letterSpacing: "0.3em",
					color: ink,
					opacity: shadow ? 0.85 : 0.55,
					textShadow: shadow,
				}}
			>
				{date}
			</span>
			<span style={bar} />
		</div>
	);
}

function Stamp({
	issue,
	date,
	ink,
	shadow,
	top,
}: NumberProps & { top: number }) {
	return (
		<div
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				top,
				textAlign: "center",
				textShadow: shadow,
			}}
		>
			<div
				style={volLabelStyle({
					fontSize: 10,
					letterSpacing: "0.32em",
					color: ink,
					opacity: 0.65,
				})}
			>
				VOL.
			</div>
			<div style={issueNumberStyle({ fontSize: 32, lineHeight: 1.2 })}>
				{issue}
			</div>
			<div
				style={{
					fontFamily: V10.mono,
					fontSize: 10,
					letterSpacing: "0.24em",
					color: ink,
					opacity: 0.5,
					marginTop: 2,
				}}
			>
				{date}
			</div>
		</div>
	);
}

/**
 * 巨大数字に添える記録行。既定は右下だが、M2 主役だけは巨大数字と重なるので
 * 右上に逃がす。
 */
function RecordLine({
	issue,
	date,
	ink,
	shadow,
	corner = "br",
}: NumberProps & { corner?: "br" | "tr" }) {
	return (
		<div
			style={{
				position: "absolute",
				right: 56,
				...(corner === "tr" ? { top: 44 } : { bottom: 40 }),
				fontFamily: V10.mono,
				fontSize: 11,
				letterSpacing: "0.24em",
				color: ink,
				opacity: shadow ? 0.85 : 0.6,
				textShadow: shadow,
			}}
		>
			VOL.{issue} — {date}
		</div>
	);
}

/** 巨大数字（d6 / g10 の背後、および節目号の M1 / M2）の共通スタイル */
const GIANT_NUMBER: CSSProperties = {
	fontFamily: "'Newsreader', serif",
	fontStyle: "italic",
	fontWeight: 500,
	lineHeight: 1,
	letterSpacing: "-0.05em",
	color: V10.ember,
};

// ─────────────────────────────────────────────────────────
// タイトル
// ─────────────────────────────────────────────────────────
const TITLE_BASE: CSSProperties = {
	fontFamily: V10.jpSerif,
	fontWeight: 600,
	letterSpacing: TSUME[TSUME_LEVEL].base,
};

function TitleBox({
	text,
	region,
	ink,
	vertical,
	max,
	shadow,
	onMeasured,
}: {
	text: string;
	region: TitleRegion;
	ink: string;
	vertical?: boolean;
	max: number;
	shadow?: string;
	onMeasured?: (px: number) => void;
}) {
	const box: Box = { w: region.w * FRAME_WIDTH, h: region.h * FRAME_HEIGHT };
	const justify =
		region.v === "top"
			? "flex-start"
			: region.v === "center"
				? "center"
				: "flex-end";
	const align = vertical
		? region.align === "center"
			? "center"
			: "flex-end"
		: region.align === "right"
			? "flex-end"
			: region.align === "center"
				? "center"
				: "flex-start";
	return (
		<div
			style={{
				position: "absolute",
				left: region.x * FRAME_WIDTH,
				top: region.y * FRAME_HEIGHT,
				width: box.w,
				height: box.h,
				display: "flex",
				flexDirection: "column",
				justifyContent: justify,
				alignItems: align,
			}}
		>
			<FitV10
				text={text}
				box={box}
				max={max}
				align={region.align}
				vertical={vertical}
				onMeasured={onMeasured}
				style={{
					...TITLE_BASE,
					lineHeight: vertical ? 1.36 : 1.26,
					color: ink,
					textShadow: shadow,
				}}
			/>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// タイトルと号数が同じ行に組まれる 3 組み
//   f7 / g7 / h1 は号数がタイトルに寄るので、TitleBox の矩形では組めない。
//   組みごとに専用の並びを持つ。
// ─────────────────────────────────────────────────────────

/** F7 浮き帯 — 下部の半透明帯の中にタイトルと号数を収める */
function BandTitle({
	f,
	onTitleMeasured,
}: {
	f: Fields;
	onTitleMeasured?: (px: number) => void;
}) {
	return (
		<div
			style={{
				position: "absolute",
				left: 40,
				right: 40,
				bottom: 40,
				height: 132,
				background: "rgba(10,9,7,0.66)",
				backdropFilter: "blur(5px)",
				WebkitBackdropFilter: "blur(5px)",
				display: "flex",
				alignItems: "center",
				gap: 40,
				padding: "0 52px",
			}}
		>
			<FitV10
				text={f.title}
				box={{ w: 770, h: 96 }}
				max={48}
				min={26}
				onMeasured={onTitleMeasured}
				style={{ ...TITLE_BASE, lineHeight: 1.26, color: V10.ink }}
			/>
			<span
				style={{
					marginLeft: "auto",
					width: 1,
					height: 58,
					background: V10.ink,
					opacity: 0.22,
					flexShrink: 0,
				}}
			/>
			<div style={{ textAlign: "right", flexShrink: 0 }}>
				<div
					style={issueNumberStyle({
						fontSize: 30,
						lineHeight: 1.1,
						color: V10.emberSoft,
					})}
				>
					Vol.{f.issue}
				</div>
				<div
					style={{
						fontFamily: V10.mono,
						fontSize: 10,
						letterSpacing: "0.24em",
						color: V10.ink,
						opacity: 0.6,
						marginTop: 3,
					}}
				>
					{f.date}
				</div>
			</div>
		</div>
	);
}

/** G7 目次風 — 左下の 1 行から点線リーダーで右の号数へ渡す */
function TocTitle({
	f,
	ink,
	plan,
	onTitleMeasured,
}: {
	f: Fields;
	ink: string;
	plan: InkPlan;
	onTitleMeasured?: (px: number) => void;
}) {
	return (
		<div
			style={{
				position: "absolute",
				left: 56,
				right: 56,
				bottom: 64,
				display: "flex",
				alignItems: "flex-end",
				gap: 24,
			}}
		>
			<FitV10
				text={f.title}
				box={{ w: 680, h: 84 }}
				max={56}
				min={28}
				nowrap
				onMeasured={onTitleMeasured}
				style={{
					...TITLE_BASE,
					lineHeight: 1.2,
					color: ink,
					textShadow: plan.shadow,
				}}
			/>
			<span
				style={{
					flex: 1,
					borderBottom: `3px dotted ${ink}`,
					opacity: plan.shadow ? 0.7 : 0.4,
					marginBottom: 12,
				}}
			/>
			<span
				style={{
					display: "flex",
					alignItems: "baseline",
					gap: 10,
					flexShrink: 0,
					textShadow: plan.msShadow,
				}}
			>
				<span
					style={volLabelStyle({
						fontSize: 11,
						letterSpacing: "0.28em",
						color: ink,
						opacity: plan.shadow ? 0.9 : 0.65,
					})}
				>
					VOL.
				</span>
				<span style={issueNumberStyle({ fontSize: 44, lineHeight: 1 })}>
					{f.issue}
				</span>
			</span>
		</div>
	);
}

/** H1 静けさ — 自動で選んだ静かな面にタイトルを置き、その尻に号数を添える */
function QuietTitle({
	f,
	region,
	max,
	ink,
	plan,
	onTitleMeasured,
}: {
	f: Fields;
	region: TitleRegion;
	max: number;
	ink: string;
	plan: InkPlan;
	onTitleMeasured?: (px: number) => void;
}) {
	return (
		<div
			style={{
				position: "absolute",
				left: region.x * FRAME_WIDTH,
				top: region.y * FRAME_HEIGHT,
				width: region.w * FRAME_WIDTH,
				height: region.h * FRAME_HEIGHT,
				display: "flex",
				alignItems: "flex-end",
				justifyContent: region.align === "right" ? "flex-end" : "flex-start",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "flex-end",
					gap: 18,
					maxWidth: "100%",
				}}
			>
				<FitV10
					text={f.title}
					box={{
						w: region.w * FRAME_WIDTH - 130,
						h: region.h * FRAME_HEIGHT,
					}}
					max={max}
					align={region.align}
					onMeasured={onTitleMeasured}
					style={{
						...TITLE_BASE,
						lineHeight: 1.26,
						color: ink,
						textShadow: plan.shadow,
					}}
				/>
				<span
					style={{
						fontFamily: V10.serif,
						fontStyle: "italic",
						fontSize: 24,
						fontWeight: 500,
						color: V10.ember,
						whiteSpace: "nowrap",
						marginBottom: 5,
						textShadow: plan.msShadow,
					}}
				>
					vol.{f.issue}
				</span>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// 節目号 — 号数が主役になる別族。タイトルは左下に回る。
//   通常の組みと違い居場所は 1 つだけで、変わるのは号数の見せ方。
//   スクリムは常に自動（ユーザーの強制を効かせない）。
// ─────────────────────────────────────────────────────────
const MILESTONE_TITLE_REGION: TitleRegion = {
	x: 0.044,
	y: 0.5,
	w: 0.52,
	h: 0.34,
	align: "left",
};

function MilestoneCover({
	f,
	stats,
	onTitleMeasured,
}: {
	f: Fields;
	stats: ImageStats | null;
	onTitleMeasured?: (px: number) => void;
}) {
	const variant = f.milestone;
	const numStr = String(Number.parseInt(f.issue, 10) || 0);
	const mean = regionMean(stats, MILESTONE_TITLE_REGION);
	const plan = inkPlan(mean, false);
	const ink = plan.ink;

	return (
		<div style={FRAME}>
			<PhotoBg src={f.image} scrim={plan.scrim ? "lb" : "none"} />

			{variant === "watermark" && (
				<div
					aria-hidden="true"
					style={{
						...GIANT_NUMBER,
						position: "absolute",
						left: -30,
						top: -70,
						fontSize: 520,
						opacity: 0.18,
						pointerEvents: "none",
					}}
				>
					{numStr}
				</div>
			)}
			{variant === "hero" && (
				<div
					aria-hidden="true"
					style={{
						...GIANT_NUMBER,
						position: "absolute",
						right: -36,
						bottom: -150,
						fontSize: 560,
						// 写真の明るい部分にだけ数字が乗る。暗部では沈むので数字が
						// 前に出すぎない
						mixBlendMode: "screen",
						opacity: 0.95,
						pointerEvents: "none",
					}}
				>
					{numStr}
				</div>
			)}
			{variant === "kanji" && (
				<div
					style={{
						position: "absolute",
						right: 66,
						top: 0,
						bottom: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 22,
					}}
				>
					<span
						style={{
							writingMode: "vertical-rl",
							fontFamily: V10.jpSerif,
							fontWeight: 600,
							fontSize: 92,
							letterSpacing: "0.1em",
							color: V10.ember,
							lineHeight: 1,
							textShadow: plan.msShadow,
						}}
					>
						第{kanjiNumber(f.issue)}号
					</span>
					<span
						style={{
							writingMode: "vertical-rl",
							fontFamily: V10.mono,
							fontSize: 11,
							letterSpacing: "0.3em",
							color: ink,
							opacity: plan.shadow ? 0.85 : 0.6,
							textShadow: plan.msShadow,
						}}
					>
						{f.date}
					</span>
				</div>
			)}

			<Masthead
				brand={f.brand}
				showMark={f.showMark}
				ink={ink}
				shadow={plan.msShadow}
			/>

			<TitleBox
				text={f.title}
				region={MILESTONE_TITLE_REGION}
				ink={ink}
				// M2 主役は巨大数字に場所を譲るので、タイトルの上限を下げる
				max={variant === "hero" ? 62 : 72}
				shadow={plan.shadow}
				onMeasured={onTitleMeasured}
			/>

			{variant === "watermark" && (
				<RecordLine
					issue={f.issue}
					date={f.date}
					ink={ink}
					shadow={plan.msShadow}
				/>
			)}
			{variant === "hero" && (
				<RecordLine
					issue={f.issue}
					date={f.date}
					ink={ink}
					shadow={plan.msShadow}
					corner="tr"
				/>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// Cover — 組みの設計図と自動インク計画を組み合わせる本体
// ─────────────────────────────────────────────────────────
export function Cover({
	f,
	onTitleMeasured,
}: {
	f: Fields;
	onTitleMeasured?: (px: number) => void;
}) {
	const stats = useImageStats(f.image);
	const kumi = KUMI[f.kumi];

	// 節目号は号数が主役の別族。組みの選択には触れずに台紙ごと差し替える
	if (f.mode === "milestone") {
		return (
			<MilestoneCover f={f} stats={stats} onTitleMeasured={onTitleMeasured} />
		);
	}

	// h1 静けさは居場所を持たない。写真のいちばん静かな面を探して決める。
	const quiet = pickQuietRegion(stats, {
		avoidMasthead: true,
		excludeVertical: true,
	});
	const region = kumi.region ?? quiet.region;
	const scrimDir: ScrimDirection = kumi.region
		? kumi.scrim === "auto"
			? "lb"
			: kumi.scrim
		: SCRIM_BY_PICK[quiet.region.id];

	const mean = regionMean(stats, region);
	// f7 は半透明の帯の中に文字を置くので、写真の明るさに関わらずオフ白で通る
	const plan: InkPlan =
		f.kumi === "f7" ? { ink: V10.ink, scrim: false } : inkPlan(mean, f.scrim);
	const ink = plan.ink;
	const numStr = String(Number.parseInt(f.issue, 10) || 0);

	return (
		<div style={FRAME}>
			<PhotoBg
				src={f.image}
				scrim={plan.scrim && scrimDir !== "none" ? scrimDir : "none"}
			/>

			{/* 背後の大判 */}
			{f.kumi === "d6" && (
				<div
					aria-hidden="true"
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						pointerEvents: "none",
					}}
				>
					<span style={{ ...GIANT_NUMBER, fontSize: 360, opacity: 0.22 }}>
						{numStr}
					</span>
				</div>
			)}
			{f.kumi === "g10" && (
				<div
					aria-hidden="true"
					style={{
						...GIANT_NUMBER,
						position: "absolute",
						right: -24,
						bottom: -110,
						fontSize: 400,
						opacity: 0.18,
						pointerEvents: "none",
					}}
				>
					{numStr}
				</div>
			)}

			<Masthead
				brand={f.brand}
				showMark={f.showMark}
				ink={ink}
				center={f.kumi === "d5"}
				shadow={plan.msShadow}
			/>

			{/* 号数の身振り。組みごとに 1 つだけ出す */}
			{f.kumi === "a1" && (
				<CornerNum
					issue={f.issue}
					date={f.date}
					ink={ink}
					shadow={plan.msShadow}
				/>
			)}
			{f.kumi === "b7" && (
				<CornerNum
					issue={f.issue}
					date={f.date}
					ink={ink}
					shadow={plan.msShadow}
					corner="bl"
				/>
			)}
			{f.kumi === "b1" && <PlateNum issue={f.issue} date={f.date} />}
			{f.kumi === "c1" && (
				<Film
					issue={f.issue}
					date={f.date}
					ink={ink}
					shadow={plan.msShadow}
					side="left"
				/>
			)}
			{f.kumi === "e7" && (
				<Film
					issue={f.issue}
					date={f.date}
					ink={ink}
					shadow={plan.msShadow}
					side="right"
				/>
			)}
			{f.kumi === "d5" && (
				<Stamp
					issue={f.issue}
					date={f.date}
					ink={ink}
					shadow={plan.msShadow}
					top={548}
				/>
			)}
			{f.kumi === "c11" && (
				<Stamp
					issue={f.issue}
					date={f.date}
					ink={ink}
					shadow={plan.msShadow}
					top={52}
				/>
			)}
			{(f.kumi === "d6" || f.kumi === "g10") && (
				<RecordLine
					issue={f.issue}
					date={f.date}
					ink={ink}
					shadow={plan.msShadow}
				/>
			)}

			{/* タイトル。f7 / g7 / h1 は号数と同じ行に組むので専用の並びを持つ */}
			{f.kumi === "f7" ? (
				<BandTitle f={f} onTitleMeasured={onTitleMeasured} />
			) : f.kumi === "g7" ? (
				<TocTitle
					f={f}
					ink={ink}
					plan={plan}
					onTitleMeasured={onTitleMeasured}
				/>
			) : f.kumi === "h1" ? (
				<QuietTitle
					f={f}
					region={region}
					max={kumi.max}
					ink={ink}
					plan={plan}
					onTitleMeasured={onTitleMeasured}
				/>
			) : (
				<TitleBox
					text={f.title}
					region={region}
					ink={ink}
					vertical={kumi.vertical}
					max={kumi.max}
					shadow={plan.shadow}
					onMeasured={onTitleMeasured}
				/>
			)}
		</div>
	);
}
