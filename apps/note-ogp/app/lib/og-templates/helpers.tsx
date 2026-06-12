import {
	type CSSProperties,
	createContext,
	type ReactNode,
	useContext,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import markCreamUrl from "ui/assets/logo/mark-cream.svg?url";
import markDarkUrl from "ui/assets/logo/mark-dark.svg?url";
import {
	mixHex,
	type OgRoles,
	paletteForSelection,
	resolveOgTheme,
} from "./palettes";
import { VIGNETTE_OVERLAY } from "./photo";
import type { Fields, FontMode, PhotoFilter, ThemeMode } from "./types";

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
// テーマ（OGP 画像内の塗り）
//   3 ロール（base / sub / accent）からの導出は palettes.ts に集約した。
//   CSS 変数は使わない — html-to-image での解決失敗を避ける。
// ─────────────────────────────────────────────────────────
export type { OgPalette, OgRoles, OgTheme } from "./palettes";
export {
	DEFAULT_PALETTE_ID,
	ogThemeFor,
	PALETTES,
	paletteById,
	paletteForSelection,
	resolveOgTheme,
	rgbaFromHex,
} from "./palettes";
export { TextureLayer } from "./texture";

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
	roles,
	label = "写真を追加",
}: {
	/** プレースホルダの面に使うロール（パレットのライト面 or ダーク面） */
	roles: OgRoles;
	label?: string;
}) {
	const from = mixHex(roles.sub, roles.base, 0.06);
	const to = mixHex(roles.sub, roles.base, 0.01);
	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				background: `linear-gradient(160deg, ${from} 0%, ${to} 70%)`,
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
					color: mixHex(roles.sub, roles.base, 0.32),
				}}
			>
				{label}
			</span>
		</div>
	);
}

/**
 * ビネット用の四隅落としレイヤー。写真と同じボックス（overflow: hidden な
 * コンテナ or フレーム直下）に absolute で重ねる。CSS filter 単体では
 * 作れないので、radial-gradient の追加レイヤーで上品に落とす。
 */
export function PhotoVignette({ filter }: { filter: PhotoFilter }) {
	if (filter !== "vignette") return null;
	return (
		<div
			aria-hidden
			style={{
				position: "absolute",
				inset: 0,
				background: VIGNETTE_OVERLAY,
				pointerEvents: "none",
			}}
		/>
	);
}

export const TITLE_NOWRAP: CSSProperties = {
	whiteSpace: "pre",
	overflowWrap: "normal",
	wordBreak: "keep-all",
};

/**
 * AutoFitTitle が確定したフォントサイズ（1280×670 基準の px）を外へ通知する
 * ための context。テンプレ実装（templates.tsx）には手を入れず、エディタ側が
 * provider を被せるだけで確定サイズを受け取れる。provider が無い文脈
 * （テンプレサムネ・縮小プレビュー）では何も通知しない。
 */
export const TitleFitContext = createContext<((px: number) => void) | null>(
	null,
);

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
	const reportFit = useContext(TitleFitContext);
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
		reportFit?.(s);
	}, [lines, width, maxH, max, min, step, reportFit]);
	return (
		<div ref={ref} style={{ ...style, width, fontSize: size, ...TITLE_NOWRAP }}>
			{lines}
		</div>
	);
}

// テーマと書体を Fields から1度に取り出すためのショートカット。
// パレット選択は写真由来の動的パレット（photoPalettes）も解決する。
export function styleFrom(f: Fields) {
	const roles = paletteForSelection(f.palette, f.photoPalettes)[f.theme];
	return { t: resolveOgTheme(roles, f.theme), ft: fonts(f.fontMode) };
}
