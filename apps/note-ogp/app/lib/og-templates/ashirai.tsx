import { paletteForSelection, resolveOgTheme, rgbaFromHex } from "./palettes";
import type { Fields } from "./types";

// ─────────────────────────────────────────────────────────
// あしらい部品（英字ウォーターマーク・リピート帯・バッジ）
//   テンプレに重ねる共通レイヤー。texture.tsx と同じ方針で、さじ加減
//   （不透明度・サイズ・配置）はすべて固定プリセットにし、盛りすぎを
//   構造的に防ぐ。CSS 変数・blend mode は使わない — html-to-image での
//   再現性を優先する。
//   - AshiraiBackdrop: ウォーターマーク + リピート帯（文字より下の背景側）
//   - AshiraiBadge:    バッジ（前景。テンプレの最後に置く）
//   Cover のように塗りがテーマ由来でないテンプレは cover でロールを渡す。
// ─────────────────────────────────────────────────────────

// 書体は helpers.ts の固定 UI フォントと同じ系列。helpers が texture 系を
// re-export する関係で、循環 import を避けるためここに定数として持つ。
const ASHIRAI_LATIN = "'Archivo', sans-serif";
const ASHIRAI_FAMILY = "'Archivo', 'LINE Seed JP', system-ui, sans-serif";
const ASHIRAI_JP = "'LINE Seed JP', system-ui, sans-serif";

/** Cover など、テーマ解決を経由しないテンプレから渡す塗りロール */
export type AshiraiInk = {
	/** 文字色相当（ウォーターマークに使う） */
	ink: string;
	/** 背景色相当（帯・バッジの文字に使う） */
	base: string;
	/** 差し色相当（帯・バッジの塗りに使う） */
	accent: string;
};

function colorsFor(f: Fields, cover?: AshiraiInk): AshiraiInk {
	if (cover) return cover;
	const roles = paletteForSelection(f.palette, f.photoPalettes)[f.theme];
	const t = resolveOgTheme(roles, f.theme);
	return { ink: t.text, base: t.bg, accent: t.accent };
}

/** 空入力時のフォールバック文言。カテゴリ → "ESSAY" の順で拾う */
function fallbackWord(f: Fields, text: string): string {
	return text.trim() || f.category.trim() || "ESSAY";
}

// ─────────────────────────────────────────────────────────
// 英字ウォーターマーク
//   下端で見切れる大きな英字 1 行。文字色を極薄にして敷く。
//   写真の上（Cover）は下端が強スクリム＋タイトルなので上端に逃がし、
//   不透明度をひと回しだけ上げる。
// ─────────────────────────────────────────────────────────
function Watermark({
	f,
	c,
	onPhoto,
}: {
	f: Fields;
	c: AshiraiInk;
	onPhoto: boolean;
}) {
	const text = fallbackWord(f, f.watermarkText).toUpperCase();
	const placement = onPhoto
		? { top: -26, fontSize: 150, color: rgbaFromHex(c.ink, 0.13) }
		: { bottom: -34, fontSize: 200, color: rgbaFromHex(c.ink, 0.06) };
	return (
		<div
			aria-hidden
			style={{
				position: "absolute",
				left: 70,
				fontFamily: ASHIRAI_LATIN,
				fontWeight: 800,
				letterSpacing: "0.01em",
				lineHeight: 1,
				whiteSpace: "nowrap",
				pointerEvents: "none",
				...placement,
			}}
		>
			{text}
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// リピートテキスト帯
//   上端または下端に accent 塗りの細い帯を敷き、単語を「·」区切りで
//   連続配置する。高さ・文字サイズ・トラッキングは固定。
// ─────────────────────────────────────────────────────────
const BAND_REPEAT = 32;

function Band({ f, c }: { f: Fields; c: AshiraiInk }) {
	const word = fallbackWord(f, f.bandText);
	return (
		<div
			aria-hidden
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				...(f.band === "top" ? { top: 0 } : { bottom: 0 }),
				height: 34,
				background: c.accent,
				color: c.base,
				display: "flex",
				alignItems: "center",
				overflow: "hidden",
				whiteSpace: "nowrap",
				fontFamily: ASHIRAI_FAMILY,
				fontSize: 12,
				fontWeight: 700,
				letterSpacing: "0.24em",
				textTransform: "uppercase",
				pointerEvents: "none",
			}}
		>
			{Array.from({ length: BAND_REPEAT }, (_, i) => (
				// 同じ単語の繰り返しで並び替えもないので index で安定する
				// biome-ignore lint/suspicious/noArrayIndexKey: stable repetition
				<span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
					{word}
					<span aria-hidden style={{ margin: "0 16px", opacity: 0.55 }}>
						·
					</span>
				</span>
			))}
		</div>
	);
}

/** 背景側のあしらい（ウォーターマーク + リピート帯）。TextureLayer の直後に置く */
export function AshiraiBackdrop({
	f,
	cover,
}: {
	f: Fields;
	cover?: AshiraiInk;
}) {
	const hasWatermark = f.watermark;
	const hasBand = f.band !== "none";
	if (!hasWatermark && !hasBand) return null;
	const c = colorsFor(f, cover);
	return (
		<>
			{hasWatermark && <Watermark f={f} c={c} onPhoto={!!cover} />}
			{hasBand && <Band f={f} c={c} />}
		</>
	);
}

// ─────────────────────────────────────────────────────────
// バッジ
//   右上の固定位置に直径 96 の丸を 1 つだけ。circle は accent 塗り、
//   stamp は枠線のみ + 内側の細リング + わずかな回転で捺した感じに。
// ─────────────────────────────────────────────────────────
const BADGE_SIZE = 96;

/** 文字数に応じた固定の段階。自由なサイズ調整は出さない */
function badgeFontSize(text: string, latin: boolean): number {
	const n = text.length;
	if (latin) {
		if (n <= 3) return 22;
		if (n <= 5) return 17;
		return 13;
	}
	if (n <= 2) return 24;
	if (n <= 3) return 20;
	if (n <= 4) return 17;
	return 13;
}

/** 前景側のあしらい（バッジ）。テンプレの最後（文字より上）に置く */
export function AshiraiBadge({ f, cover }: { f: Fields; cover?: AshiraiInk }) {
	if (f.badge === "none") return null;
	const c = colorsFor(f, cover);
	const text = f.badgeText.trim() || "NEW";
	const latin = /^[\x20-\x7e]+$/.test(text);
	const stamp = f.badge === "stamp";
	return (
		<div
			aria-hidden
			style={{
				position: "absolute",
				right: 70,
				top: 104,
				width: BADGE_SIZE,
				height: BADGE_SIZE,
				borderRadius: "50%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				textAlign: "center",
				padding: 10,
				boxSizing: "border-box",
				transform: stamp ? "rotate(-8deg)" : undefined,
				background: stamp ? "transparent" : c.accent,
				border: stamp ? `2px solid ${c.accent}` : undefined,
				color: stamp ? c.accent : c.base,
				fontFamily: latin ? ASHIRAI_LATIN : ASHIRAI_JP,
				fontWeight: latin ? 800 : 700,
				fontSize: badgeFontSize(text, latin),
				letterSpacing: latin ? "0.08em" : "0.06em",
				lineHeight: 1.25,
				textTransform: "uppercase",
				pointerEvents: "none",
			}}
		>
			{stamp && (
				<span
					aria-hidden
					style={{
						position: "absolute",
						inset: 5,
						borderRadius: "50%",
						border: `1px solid ${rgbaFromHex(c.accent, 0.55)}`,
					}}
				/>
			)}
			<span style={{ position: "relative" }}>{text}</span>
		</div>
	);
}
