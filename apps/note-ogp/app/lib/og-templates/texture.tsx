import { paletteForSelection, resolveOgTheme, rgbaFromHex } from "./palettes";
import type { Fields, PaperStrength } from "./types";

// ─────────────────────────────────────────────────────────
// 背景の質感レイヤー
//   ベース色のベタ塗りの直上（文字より下）に敷く 1 枚。さじ加減は固定
//   プリセットで、不透明度の自由調整は出さない（盛りすぎを構造的に防ぐ）。
//   - paper:    feTurbulence の SVG ノイズ（データ URI・外部画像なし）
//   - gradient: 同色相・明度差小の対角グラデーション（DESIGN.md の禁則内）
//   - shape:    accent 色を低不透明度にした大円 1 つ。右端で見切れる
//   CSS 変数・blend mode は使わない — html-to-image での再現性を優先する。
// ─────────────────────────────────────────────────────────

/** hex を 0〜1 の RGB に直す（feColorMatrix の係数用） */
function hexToUnitRgb(hex: string): [number, number, number] {
	let n = hex.replace("#", "");
	if (n.length === 3) {
		n = n
			.split("")
			.map((c) => c + c)
			.join("");
	}
	const ch = (i: number) => Number.parseInt(n.slice(i, i + 2), 16) / 255;
	return [ch(0), ch(2), ch(4)];
}

/**
 * 紙質感ノイズの SVG データ URI。
 * feTurbulence のノイズを feColorMatrix で「単色 + ノイズ由来のアルファ」に
 * 変換する。フィルタもタイルも SVG 内で完結し、外部リソースを参照しない。
 */
function paperNoiseUrl(hex: string): string {
	const [r, g, b] = hexToUnitRgb(hex);
	const f = (v: number) => v.toFixed(4);
	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">` +
		`<filter id="n" x="0" y="0" width="100%" height="100%">` +
		`<feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" stitchTiles="stitch"/>` +
		`<feColorMatrix type="matrix" values="0 0 0 0 ${f(r)} 0 0 0 0 ${f(g)} 0 0 0 0 ${f(b)} 0.55 0 0 0 0"/>` +
		`</filter>` +
		`<rect width="240" height="240" filter="url(#n)"/>` +
		`</svg>`;
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 紙テクスチャの強度は弱 / 中の 2 段のみ
const PAPER_OPACITY: Record<PaperStrength, number> = {
	weak: 0.16,
	medium: 0.3,
};

export function TextureLayer({ f }: { f: Fields }) {
	if (f.texture === "none") return null;
	const roles = paletteForSelection(f.palette, f.photoPalettes)[f.theme];
	const t = resolveOgTheme(roles, f.theme);

	if (f.texture === "paper") {
		return (
			<div
				aria-hidden
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage: `url("${paperNoiseUrl(t.text)}")`,
					backgroundRepeat: "repeat",
					backgroundSize: "240px 240px",
					opacity: PAPER_OPACITY[f.paperStrength],
					pointerEvents: "none",
				}}
			/>
		);
	}

	if (f.texture === "gradient") {
		// ベース色の上に text（= sub）を極薄で対角に重ねる。同色相のまま
		// 明度だけがわずかに動くので、ライト面では翳り、ダーク面では明るみになる。
		return (
			<div
				aria-hidden
				style={{
					position: "absolute",
					inset: 0,
					background: `linear-gradient(150deg, ${rgbaFromHex(t.text, 0.07)} 0%, ${rgbaFromHex(t.text, 0)} 46%, ${rgbaFromHex(t.text, 0.04)} 100%)`,
					pointerEvents: "none",
				}}
			/>
		);
	}

	// shape: accent の大円 1 つ。右端で見切れる位置・低不透明度の固定プリセット
	return (
		<div
			aria-hidden
			style={{
				position: "absolute",
				width: 860,
				height: 860,
				borderRadius: "50%",
				right: -300,
				top: -220,
				background: rgbaFromHex(t.accent, 0.1),
				pointerEvents: "none",
			}}
		/>
	);
}
