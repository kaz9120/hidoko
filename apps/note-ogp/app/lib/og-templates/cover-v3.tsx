import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";
import type {
	Fields,
	NumberCorner,
	NumberOpts,
	NumberTreatment,
	Scrim,
	TitleSlot,
} from "./types";

// note-ogp v3 — 写真フルブリードを土台に固定。号によって変えるのは
// 「タイトルの居場所」「号数の身振り」「スクリムの方向」のみ。

const V3 = {
	ink: "#f5f1e6",
	inkDim: "#d4cdc1",
	inkMute: "#a8a094",
	ember: "#f47d3a",
	emberSoft: "#f8a05c",
	emberDeep: "#c64414",
	serif: "'Newsreader', 'Shippori Mincho', serif",
	sans: "'LINE Seed JP', 'Inter', system-ui, sans-serif",
	latin: "'Archivo', sans-serif",
} as const;

const FRAME: CSSProperties = {
	width: 1280,
	height: 670,
	position: "relative",
	overflow: "hidden",
	fontFeatureSettings: '"palt"',
	WebkitFontSmoothing: "antialiased",
	color: V3.ink,
	background: "#0a0907",
};

const TITLE_NOWRAP: CSSProperties = {
	whiteSpace: "pre",
	overflowWrap: "normal",
	wordBreak: "keep-all",
};

const FALLBACK_GRADIENT =
	"radial-gradient(ellipse 55% 45% at 32% 58%, #f47d3a 0%, #c64414 12%, #6b220c 28%, #2a0e04 55%, #0a0907 90%), linear-gradient(135deg, #1a0e08 0%, #050402 100%)";

// 写真の暗部をどこに置くか。タイトル位置から自動推定するための対応表。
const SCRIM_BY_SLOT: Record<TitleSlot, Scrim> = {
	bl: "lb",
	br: "rb",
	tl: "lt",
	center: "c",
	rcol: "r",
	topwide: "t",
};

// 号数を置くコーナーは、タイトル位置と衝突しないように自動で切り替える。
export function pickNumberCorner(slot: TitleSlot): NumberCorner {
	return slot === "tl" ? "br" : "tr";
}

export function resolveScrim(slot: TitleSlot, scrim: Scrim): Scrim {
	return scrim === "auto" ? SCRIM_BY_SLOT[slot] : scrim;
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

export function V3Mark({
	size = 22,
	color = V3.emberSoft,
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

const SCRIM_CSS: Record<Exclude<Scrim, "auto">, string> = {
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

function PhotoBg({ src, scrim }: { src: string | null; scrim: Scrim }) {
	const resolved = scrim === "auto" ? "lb" : scrim;
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
					background: SCRIM_CSS[resolved],
					pointerEvents: "none",
				}}
			/>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// 連載ワードマーク（左上固定）
// ─────────────────────────────────────────────────────────
function Wordmark({ brand, showMark }: { brand: string; showMark: boolean }) {
	return (
		<div
			style={{
				position: "absolute",
				top: 36,
				left: 56,
				display: "flex",
				alignItems: "center",
				gap: 12,
				lineHeight: 1,
			}}
		>
			{showMark && <V3Mark size={22} color={V3.emberSoft} />}
			<span
				style={{
					fontFamily: V3.sans,
					fontSize: 13,
					fontWeight: 700,
					letterSpacing: "0.02em",
					color: V3.ink,
					textShadow: "0 1px 8px rgba(0,0,0,0.5)",
				}}
			>
				{brand}
			</span>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// 著者（左下固定）。タイトルが左下のときは右下に逃がす。
// ─────────────────────────────────────────────────────────
function Author({
	author,
	account,
	position,
}: {
	author: string;
	account: string;
	position: "bl" | "br";
}) {
	const pos =
		position === "br"
			? { right: 56, bottom: 36, alignItems: "flex-end" as const }
			: { left: 56, bottom: 36, alignItems: "flex-start" as const };
	return (
		<div
			style={{
				position: "absolute",
				...pos,
				display: "flex",
				flexDirection: "column",
				gap: 4,
				textShadow: "0 1px 8px rgba(0,0,0,0.55)",
			}}
		>
			<div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
				<span
					style={{
						fontFamily: V3.sans,
						fontSize: 13,
						fontWeight: 700,
						color: V3.ink,
					}}
				>
					{author}
				</span>
				{account && (
					<span
						style={{
							fontFamily: V3.latin,
							fontSize: 11,
							color: V3.inkDim,
							opacity: 0.85,
						}}
					>
						{account}
					</span>
				)}
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// 号数の身振り 5 種
// ─────────────────────────────────────────────────────────
function NumberCornerView({
	issue,
	date,
	corner,
}: {
	issue: string;
	date: string;
	corner: NumberCorner;
}) {
	const pad3 = String(issue || "001").padStart(3, "0");
	const positions: Record<NumberCorner, CSSProperties> = {
		tr: { top: 36, right: 56, alignItems: "flex-end" as const },
		br: { bottom: 36, right: 56, alignItems: "flex-end" as const },
		bl: { bottom: 36, left: 56, alignItems: "flex-start" as const },
	};
	return (
		<div
			style={{
				position: "absolute",
				...positions[corner],
				display: "flex",
				flexDirection: "column",
				gap: 2,
				textShadow: "0 1px 8px rgba(0,0,0,0.55)",
				textAlign: corner === "bl" ? "left" : "right",
			}}
		>
			<span
				style={{
					fontFamily: V3.latin,
					fontSize: 10,
					fontWeight: 600,
					letterSpacing: "0.32em",
					textTransform: "uppercase",
					color: V3.inkMute,
				}}
			>
				Vol.
			</span>
			<span
				style={{
					fontFamily: V3.serif,
					fontStyle: "italic",
					fontSize: 34,
					fontWeight: 500,
					lineHeight: 1,
					color: V3.emberSoft,
					letterSpacing: "-0.01em",
				}}
			>
				{pad3}
			</span>
			<span
				style={{
					fontFamily: V3.latin,
					fontSize: 10,
					fontWeight: 500,
					letterSpacing: "0.24em",
					color: V3.inkMute,
					marginTop: 4,
				}}
			>
				{date}
			</span>
		</div>
	);
}

function NumberVerticalView({
	issue,
	date,
	side,
}: {
	issue: string;
	date: string;
	side: "left" | "right";
}) {
	const pad3 = String(issue || "001").padStart(3, "0");
	const text = `VOL.${pad3}  ·  ${date}`;
	return (
		<div
			style={{
				position: "absolute",
				...(side === "right"
					? { right: 28, top: 0, bottom: 0 }
					: { left: 28, top: 0, bottom: 0 }),
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				writingMode: "vertical-rl",
				textShadow: "0 1px 8px rgba(0,0,0,0.55)",
			}}
		>
			<span
				style={{
					fontFamily: V3.latin,
					fontSize: 12,
					fontWeight: 600,
					letterSpacing: "0.42em",
					color: V3.emberSoft,
				}}
			>
				{text}
			</span>
		</div>
	);
}

const NUMBER_WORDS_EN: Record<number, string> = {
	1: "One",
	2: "Two",
	3: "Three",
	4: "Four",
	5: "Five",
	6: "Six",
	7: "Seven",
	8: "Eight",
	9: "Nine",
	10: "Ten",
	11: "Eleven",
	12: "Twelve",
	13: "Thirteen",
	14: "Fourteen",
	15: "Fifteen",
	16: "Sixteen",
	17: "Seventeen",
	18: "Eighteen",
	19: "Nineteen",
	20: "Twenty",
	21: "Twenty-One",
};
function spellOut(n: string): string {
	const num = Number.parseInt(n, 10);
	if (!Number.isFinite(num)) return n;
	if (NUMBER_WORDS_EN[num]) return NUMBER_WORDS_EN[num];
	if (num > 20 && num < 30) {
		const tail = NUMBER_WORDS_EN[num - 20] ?? "";
		return tail ? `Twenty-${tail.toLowerCase()}` : String(num);
	}
	return String(num);
}

function NumberWrittenView({
	issue,
	date,
	position,
}: {
	issue: string;
	date: string;
	position?: { left: number; bottom: number };
}) {
	const pos = position ?? { left: 56, bottom: 100 };
	return (
		<div
			style={{
				position: "absolute",
				left: pos.left,
				bottom: pos.bottom,
				textShadow: "0 1px 8px rgba(0,0,0,0.55)",
			}}
		>
			<span
				style={{
					fontFamily: V3.serif,
					fontStyle: "italic",
					fontSize: 18,
					fontWeight: 400,
					letterSpacing: "0.01em",
					color: V3.emberSoft,
				}}
			>
				Volume {spellOut(issue)}
			</span>
			<span
				style={{
					fontFamily: V3.serif,
					fontStyle: "italic",
					fontSize: 18,
					fontWeight: 400,
					color: V3.inkMute,
				}}
			>
				{" "}
				&nbsp;—&nbsp; {date}
			</span>
		</div>
	);
}

function NumberPlateView({
	issue,
	date,
	corner,
}: {
	issue: string;
	date: string;
	corner: NumberCorner;
}) {
	const pad3 = String(issue || "001").padStart(3, "0");
	const positions: Record<NumberCorner, CSSProperties> = {
		tr: { top: 32, right: 56 },
		br: { bottom: 32, right: 56 },
		bl: { bottom: 32, left: 56 },
	};
	return (
		<div
			style={{
				position: "absolute",
				...positions[corner],
				display: "flex",
				alignItems: "stretch",
				border: "1px solid rgba(212,205,193,0.35)",
				background: "rgba(8,7,5,0.45)",
				backdropFilter: "blur(6px)",
				WebkitBackdropFilter: "blur(6px)",
			}}
		>
			<div
				style={{
					padding: "10px 14px",
					display: "flex",
					flexDirection: "column",
					gap: 3,
					borderRight: "1px solid rgba(212,205,193,0.25)",
				}}
			>
				<span
					style={{
						fontFamily: V3.latin,
						fontSize: 9,
						fontWeight: 700,
						letterSpacing: "0.32em",
						color: V3.inkMute,
						textTransform: "uppercase",
					}}
				>
					Vol.
				</span>
				<span
					style={{
						fontFamily: V3.serif,
						fontStyle: "italic",
						fontSize: 24,
						fontWeight: 500,
						lineHeight: 1,
						color: V3.emberSoft,
						letterSpacing: "-0.01em",
					}}
				>
					{pad3}
				</span>
			</div>
			<div
				style={{
					padding: "10px 14px",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					gap: 3,
				}}
			>
				<span
					style={{
						fontFamily: V3.latin,
						fontSize: 9,
						fontWeight: 700,
						letterSpacing: "0.28em",
						color: V3.inkMute,
						textTransform: "uppercase",
					}}
				>
					Issued
				</span>
				<span
					style={{
						fontFamily: V3.latin,
						fontSize: 11,
						fontWeight: 500,
						letterSpacing: "0.16em",
						color: V3.inkDim,
					}}
				>
					{date}
				</span>
			</div>
		</div>
	);
}

function NumberWatermarkView({ issue }: { issue: string }) {
	const pad3 = String(issue || "001").padStart(3, "0");
	return (
		<div
			aria-hidden="true"
			style={{
				position: "absolute",
				left: -30,
				top: 30,
				fontFamily: V3.serif,
				fontStyle: "italic",
				fontSize: 520,
				lineHeight: 1,
				fontWeight: 500,
				color: "rgba(244,125,58,0.28)",
				letterSpacing: "-0.05em",
				pointerEvents: "none",
				userSelect: "none",
				textShadow: "0 0 50px rgba(244,125,58,0.18)",
			}}
		>
			{pad3}
		</div>
	);
}

function IssueNumber({
	treatment,
	issue,
	date,
	opts,
}: {
	treatment: NumberTreatment;
	issue: string;
	date: string;
	opts: NumberOpts;
}) {
	switch (treatment) {
		case "corner":
			return (
				<NumberCornerView
					issue={issue}
					date={date}
					corner={opts.corner ?? "tr"}
				/>
			);
		case "vertical":
			return (
				<NumberVerticalView
					issue={issue}
					date={date}
					side={opts.side ?? "right"}
				/>
			);
		case "written":
			return (
				<NumberWrittenView issue={issue} date={date} position={opts.position} />
			);
		case "plate":
			return (
				<NumberPlateView
					issue={issue}
					date={date}
					corner={opts.corner ?? "tr"}
				/>
			);
		case "watermark":
			return <NumberWatermarkView issue={issue} />;
	}
}

// ─────────────────────────────────────────────────────────
// タイトルの居場所 6 種
// ─────────────────────────────────────────────────────────
type TitleSlotConfig = {
	box: CSSProperties;
	width: number;
	maxH: number;
	max: number;
	min: number;
	align: "left" | "right" | "center";
};

const TITLE_SLOTS: Record<TitleSlot, TitleSlotConfig> = {
	bl: {
		box: { left: 56, bottom: 130, width: 800 },
		width: 800,
		maxH: 320,
		max: 76,
		min: 32,
		align: "left",
	},
	br: {
		box: { right: 56, bottom: 130, width: 720 },
		width: 720,
		maxH: 300,
		max: 72,
		min: 30,
		align: "right",
	},
	tl: {
		box: { left: 56, top: 110, width: 700 },
		width: 700,
		maxH: 320,
		max: 72,
		min: 30,
		align: "left",
	},
	center: {
		box: { left: 64, right: 64, top: "50%", transform: "translateY(-50%)" },
		width: 1152,
		maxH: 380,
		max: 96,
		min: 36,
		align: "center",
	},
	rcol: {
		box: { right: 56, top: 140, width: 460 },
		width: 460,
		maxH: 420,
		max: 68,
		min: 28,
		align: "left",
	},
	topwide: {
		box: { left: 56, right: 56, top: 130 },
		width: 1168,
		maxH: 220,
		max: 72,
		min: 28,
		align: "left",
	},
};

function AutoFitTitle({
	text,
	width,
	maxH,
	max,
	min,
	align,
	step = 2,
	style,
	onMeasured,
}: {
	text: string;
	width: number;
	maxH: number;
	max: number;
	min: number;
	align: "left" | "right" | "center";
	step?: number;
	style?: CSSProperties;
	onMeasured?: (px: number) => void;
}) {
	const ref = useRef<HTMLDivElement | null>(null);
	const [size, setSize] = useState(max);
	// text は effect 内で直接読まないが、children として描画される結果を
	// scrollWidth / Height で測るため、text が変われば再フィットさせたい。
	// biome-ignore lint/correctness/useExhaustiveDependencies: text 変更時に DOM 再測定が必要
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		let s = max;
		el.style.fontSize = `${s}px`;
		let guard = 0;
		while (
			guard++ < 80 &&
			s > min &&
			(el.scrollWidth > Math.ceil(width) || el.scrollHeight > Math.ceil(maxH))
		) {
			s -= step;
			el.style.fontSize = `${s}px`;
		}
		setSize(s);
		onMeasured?.(s);
	}, [text, width, maxH, max, min, step, onMeasured]);

	// 改行は手動指定どおりに保持する（自動折り返しなし）。
	// TITLE_NOWRAP の whiteSpace: "pre" が \n をそのままレンダリングに反映
	// するので、行ごとに <div> を作る必要はない（先頭行の編集で後続行の
	// key が全部ずれて React の差分が不安定になるのを避ける）。
	return (
		<div
			ref={ref}
			style={{
				...style,
				width,
				fontSize: size,
				textAlign: align,
				...TITLE_NOWRAP,
			}}
		>
			{text || " "}
		</div>
	);
}

function Title({
	text,
	lead,
	slot,
	showLead,
	onMeasured,
}: {
	text: string;
	lead: string;
	slot: TitleSlot;
	showLead: boolean;
	onMeasured?: (px: number) => void;
}) {
	const cfg = TITLE_SLOTS[slot];
	return (
		<div style={{ position: "absolute", ...cfg.box }}>
			<AutoFitTitle
				text={text}
				width={cfg.width}
				maxH={cfg.maxH}
				max={cfg.max}
				min={cfg.min}
				align={cfg.align}
				onMeasured={onMeasured}
				style={{
					fontFamily: V3.serif,
					fontWeight: 600,
					lineHeight: 1.28,
					letterSpacing: "0.005em",
					color: V3.ink,
					textShadow: "0 2px 14px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.55)",
				}}
			/>
			{showLead && lead && (
				<div
					style={{
						marginTop: 18,
						maxWidth: Math.min(cfg.width, 620),
						marginLeft:
							cfg.align === "right"
								? "auto"
								: cfg.align === "center"
									? "auto"
									: 0,
						marginRight: cfg.align === "center" ? "auto" : 0,
						fontFamily: V3.sans,
						fontSize: 17,
						lineHeight: 1.7,
						color: V3.inkDim,
						textShadow: "0 1px 10px rgba(0,0,0,0.55)",
						whiteSpace: "pre-wrap",
					}}
				>
					{lead}
				</div>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// Cover — 土台 + 身振りを組み合わせる本体
// ─────────────────────────────────────────────────────────
export function Cover({
	f,
	onTitleMeasured,
}: {
	f: Fields;
	onTitleMeasured?: (px: number) => void;
}) {
	const scrim = resolveScrim(f.titleSlot, f.scrim);
	// 著者ブロックはタイトル左下とぶつかるので右下に逃がす。それ以外は左下。
	const authorPos: "bl" | "br" = f.titleSlot === "bl" ? "br" : "bl";
	// Watermark のとき、タイトル左下と巨大数字が重なるので、号数コーナーも併置する。
	const showCornerOnWatermark = f.numberTreatment === "watermark";
	return (
		<div style={FRAME}>
			<PhotoBg src={f.image} scrim={scrim} />
			{f.numberTreatment === "watermark" && (
				<NumberWatermarkView issue={f.issue} />
			)}
			<Wordmark brand={f.brand} showMark={f.showMark} />
			<Title
				text={f.title}
				lead={f.lead}
				slot={f.titleSlot}
				showLead={f.showLead}
				onMeasured={onTitleMeasured}
			/>
			<Author author={f.author} account={f.account} position={authorPos} />
			{f.numberTreatment !== "watermark" && (
				<IssueNumber
					treatment={f.numberTreatment}
					issue={f.issue}
					date={f.date}
					opts={f.numberOpts}
				/>
			)}
			{showCornerOnWatermark && (
				<NumberCornerView issue={f.issue} date={f.date} corner="br" />
			)}
		</div>
	);
}

export const FRAME_WIDTH = 1280;
export const FRAME_HEIGHT = 670;
