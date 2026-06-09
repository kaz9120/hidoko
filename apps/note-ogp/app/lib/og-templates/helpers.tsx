import {
	type CSSProperties,
	type ReactNode,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import markCreamUrl from "ui/assets/logo/mark-cream.svg?url";
import markDarkUrl from "ui/assets/logo/mark-dark.svg?url";
import type { Fields, FontMode, ThemeMode } from "./types";

// ─────────────────────────────────────────────────────────
// 書体システム
//   タイトルだけが切り替わる（明朝／ゴシック／手書き）。
//   ブランド・著者・日付・リードは常に下の UI フォントで固定。
// ─────────────────────────────────────────────────────────
type TitleFont = {
	jp: string;
	latin: string;
	titleWeight: number;
	titleTrack: string;
	titleLeading: number;
};

export function fonts(mode: FontMode): TitleFont {
	if (mode === "gothic") {
		return {
			jp: "'Zen Kaku Gothic New'",
			latin: "'Archivo'",
			titleWeight: 800,
			titleTrack: "-0.005em",
			titleLeading: 1.32,
		};
	}
	if (mode === "hand") {
		return {
			jp: "'Klee One'",
			latin: "'Klee One'",
			titleWeight: 600,
			titleTrack: "0.005em",
			titleLeading: 1.5,
		};
	}
	return {
		jp: "'Shippori Mincho'",
		latin: "'Newsreader'",
		titleWeight: 600,
		titleTrack: "0.01em",
		titleLeading: 1.42,
	};
}

export function titleFamily(ft: TitleFont): string {
	return `${ft.latin}, ${ft.jp}, serif`;
}

// 固定 UI フォント（タイトル以外は常にこれ）
export const UI_JP = "'LINE Seed JP', system-ui, sans-serif";
export const UI_LATIN = "'Archivo', sans-serif";

// ─────────────────────────────────────────────────────────
// テーマ（OGP 画像内の塗り。CSS 変数は使わない — html-to-image での解決失敗を避ける）
// ─────────────────────────────────────────────────────────
export type OgTheme = {
	bg: string;
	text: string;
	muted: string;
	faint: string;
	rule: string;
	ruleStrong: string;
	accent: string;
};

export function theme(mode: ThemeMode): OgTheme {
	if (mode === "light") {
		return {
			bg: "#f7f2e8",
			text: "#1b1610",
			muted: "#6c6253",
			faint: "#a0937f",
			rule: "#ddd3bf",
			ruleStrong: "#c9bca2",
			accent: "#bd4718",
		};
	}
	return {
		bg: "#13100c",
		text: "#f3ede1",
		muted: "#9c9285",
		faint: "#6b6256",
		rule: "#2e2820",
		ruleStrong: "#473f33",
		accent: "#f47d3a",
	};
}

// ─────────────────────────────────────────────────────────
// ロゴ URL の選び方（snapcrop と同じ「背景色と同じ外縁色」規則）
//   背景が明るい (cream) → mark-cream.svg：外縁クリーム / 中心ダークでハートが浮く
//   背景が暗い (dark)    → mark-dark.svg：外縁ダーク / 中心 ember でハートが浮く
// ─────────────────────────────────────────────────────────
export function markUrlFor(themeMode: ThemeMode): string {
	return themeMode === "light" ? markCreamUrl : markDarkUrl;
}

// ─────────────────────────────────────────────────────────
// 共通ヘルパー
// ─────────────────────────────────────────────────────────
// 改行は指定どおりに。自動では折り返さない（whiteSpace: pre）。
export function renderLines(text: string | undefined): ReactNode[] {
	return (text ?? "").split("\n").map((line, i) => (
		// 同じ index は並び替えがないので安定する
		// biome-ignore lint/suspicious/noArrayIndexKey: stable order
		<div key={i}>{line || " "}</div>
	));
}

export const FRAME_BASE: CSSProperties = {
	width: 1280,
	height: 670,
	position: "relative",
	overflow: "hidden",
	fontFeatureSettings: '"palt"',
	WebkitFontSmoothing: "antialiased",
};

export const M = 78; // 外余白

// 小ラベル（編集的 small-caps 風・固定書体）
export function Kicker({
	color,
	children,
	style,
}: {
	color: string;
	children: ReactNode;
	style?: CSSProperties;
}) {
	return (
		<span
			style={{
				fontFamily: UI_LATIN,
				fontSize: 13,
				fontWeight: 600,
				letterSpacing: "0.22em",
				textTransform: "uppercase",
				color,
				...style,
			}}
		>
			{children}
		</span>
	);
}

// ブランド表記（マーク・ロックアップ）
export function Brand({
	color,
	text,
	showMark,
	markUrl,
	size = 16,
	markSize = 23,
	gap = 12,
	center = false,
}: {
	color: string;
	text: string;
	showMark: boolean;
	markUrl: string;
	size?: number;
	markSize?: number;
	gap?: number;
	center?: boolean;
}) {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: center ? "center" : "flex-start",
				gap,
			}}
		>
			{showMark && (
				<span style={{ display: "inline-flex", transform: "translateY(-8%)" }}>
					<img
						src={markUrl}
						width={markSize}
						height={markSize}
						alt=""
						style={{ display: "block" }}
					/>
				</span>
			)}
			<span
				style={{
					fontFamily: UI_JP,
					fontSize: size,
					fontWeight: 700,
					letterSpacing: "0.01em",
					color,
				}}
			>
				{text}
			</span>
		</span>
	);
}

export function PhotoPlaceholder({
	dark,
	label = "写真を追加",
}: {
	dark: boolean;
	label?: string;
}) {
	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				background: dark
					? "linear-gradient(160deg, #221c15 0%, #14110d 70%)"
					: "linear-gradient(160deg, #ece3d2 0%, #f3ece0 70%)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<span
				style={{
					fontFamily: "'Newsreader', serif",
					fontStyle: "italic",
					fontSize: 22,
					color: dark ? "#5a5145" : "#b3a791",
				}}
			>
				{label}
			</span>
		</div>
	);
}

export const TITLE_NOWRAP: CSSProperties = {
	whiteSpace: "pre",
	overflowWrap: "normal",
	wordBreak: "keep-all",
};

// タイトル自動フィット：指定の枠（幅・高さ）に収まるまでフォントを縮小。
//   手動改行は尊重（自動では折り返さない）。実寸測定なので右余白が必ず残る。
export function AutoFitTitle({
	lines,
	style,
	width,
	maxH,
	max,
	min,
	step = 2,
}: {
	lines: ReactNode;
	style?: CSSProperties;
	width: number;
	maxH?: number;
	max: number;
	min: number;
	step?: number;
}) {
	const ref = useRef<HTMLDivElement | null>(null);
	const [size, setSize] = useState(max);
	// lines は effect 内のコードからは読まないが、children として描画される
	// 結果を scrollWidth/Height で測るため、lines が変われば再フィットさせたい。
	// biome-ignore lint/correctness/useExhaustiveDependencies: lines 変更時に DOM 再測定が必要
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		let s = max;
		el.style.fontSize = `${s}px`;
		let guard = 0;
		while (
			guard++ < 80 &&
			s > min &&
			(el.scrollWidth > Math.ceil(width) ||
				(!!maxH && el.scrollHeight > Math.ceil(maxH)))
		) {
			s -= step;
			el.style.fontSize = `${s}px`;
		}
		setSize(s);
	}, [lines, width, maxH, max, min, step]);
	return (
		<div ref={ref} style={{ ...style, width, fontSize: size, ...TITLE_NOWRAP }}>
			{lines}
		</div>
	);
}

// テーマと書体を Fields から1度に取り出すためのショートカット
export function styleFrom(f: Fields) {
	return { t: theme(f.theme), ft: fonts(f.fontMode) };
}
