import type { OgRoles, PhotoPalette, ThemeMode } from "./og-templates";

// ─────────────────────────────────────────────────────────
// 写真からの配色提案（Issue #87）
//
// 1. 抽出: 画像を最大 48px に縮小した canvas へ描き、RGB 各 4bit に量子化した
//    頻度ビンからキーカラーを 1 色選ぶ（彩度・中間明度を重み付け）。
// 2. 生成: キーカラーから「馴染ませ（写真と同系色でトーンを揃える）」と
//    「引き立て（キーカラーの反対色をアクセントに置く）」の 2 案を、
//    プリセットと同じ base / sub / accent × light / dark 構造で組み立てる。
// 3. 補正: DESIGN.md の禁則（純白・純黒・高彩度の緑青）を彩度・明度クランプで
//    守り、文字（sub）と背景（base）のコントラスト比を WCAG 換算で確保する。
//
// 外部ライブラリには依存しない。
// ─────────────────────────────────────────────────────────

type Hsl = { h: number; s: number; l: number };

// ─── 色空間ヘルパー ───────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
	const n = hex.replace("#", "");
	return [
		Number.parseInt(n.slice(0, 2), 16),
		Number.parseInt(n.slice(2, 4), 16),
		Number.parseInt(n.slice(4, 6), 16),
	];
}

function rgbToHex(r: number, g: number, b: number): string {
	const ch = (v: number) =>
		Math.round(Math.min(255, Math.max(0, v)))
			.toString(16)
			.padStart(2, "0");
	return `#${ch(r)}${ch(g)}${ch(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	const d = max - min;
	if (d === 0) return { h: 0, s: 0, l };
	const s = d / (1 - Math.abs(2 * l - 1));
	let h: number;
	if (max === rn) h = ((gn - bn) / d) % 6;
	else if (max === gn) h = (bn - rn) / d + 2;
	else h = (rn - gn) / d + 4;
	h *= 60;
	if (h < 0) h += 360;
	return { h, s, l };
}

function hslToHex({ h, s, l }: Hsl): string {
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const hp = (((h % 360) + 360) % 360) / 60;
	const x = c * (1 - Math.abs((hp % 2) - 1));
	let rgb: [number, number, number];
	if (hp < 1) rgb = [c, x, 0];
	else if (hp < 2) rgb = [x, c, 0];
	else if (hp < 3) rgb = [0, c, x];
	else if (hp < 4) rgb = [0, x, c];
	else if (hp < 5) rgb = [x, 0, c];
	else rgb = [c, 0, x];
	const m = l - c / 2;
	return rgbToHex((rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255);
}

function hexToHsl(hex: string): Hsl {
	const [r, g, b] = hexToRgb(hex);
	return rgbToHsl(r, g, b);
}

// ─── WCAG コントラスト ─────────────────────────────────────

function relativeLuminance(hex: string): number {
	const lin = (v: number) => {
		const c = v / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	const [r, g, b] = hexToRgb(hex);
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG 2.x のコントラスト比（1〜21） */
export function contrastRatio(a: string, b: string): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
	return (hi + 0.05) / (lo + 0.05);
}

// ─── DESIGN.md 禁則のクランプ ─────────────────────────────

const clamp = (v: number, min: number, max: number) =>
	Math.min(max, Math.max(min, v));

/** 黄緑〜青の帯域（高彩度禁則の対象）かどうか */
function isCoolHue(h: number): boolean {
	const hn = ((h % 360) + 360) % 360;
	return hn >= 70 && hn < 260;
}

/**
 * アクセント彩度の上限。プリセットの実測（苔 ≈0.28 / 月白 ≈0.21 / 焚き火 ≈0.70）
 * に合わせ、緑青は低め・暖色はやや高めに抑える。
 */
function accentSatCap(h: number): number {
	return isCoolHue(h) ? 0.32 : 0.68;
}

// 明度の可動域。0.04〜0.96 に収めることで純白 #ffffff / 純黒 #000000 を避ける。
const L_MIN = 0.04;
const L_MAX = 0.96;

// ─── コントラスト自動補正 ─────────────────────────────────

// 文字（sub）×背景（base）の目標比。WCAG AA の 4.5:1 に余裕を持たせる。
const TEXT_CONTRAST_TARGET = 7;
// アクセント×背景は図像・大きな数字用なので 3:1 を目標にする。
const ACCENT_CONTRAST_TARGET = 3;

/**
 * sub / accent の明度を base から離す方向へ寄せて、コントラスト比を確保する。
 * 明度は L_MIN〜L_MAX に収めたまま動かす（純白・純黒には到達しない）。
 */
function ensureReadable(roles: OgRoles, mode: ThemeMode): OgRoles {
	const base = hexToHsl(roles.base);
	const sub = hexToHsl(roles.sub);
	const accent = hexToHsl(roles.accent);
	// ライト面は「背景を明るく・文字を暗く」、ダーク面はその逆へ寄せる
	const dir = mode === "light" ? -1 : 1;

	for (
		let i = 0;
		i < 40 &&
		contrastRatio(hslToHex(sub), hslToHex(base)) < TEXT_CONTRAST_TARGET;
		i++
	) {
		sub.l = clamp(sub.l + dir * 0.02, L_MIN, L_MAX);
		base.l = clamp(base.l - dir * 0.005, L_MIN, L_MAX);
	}
	for (
		let i = 0;
		i < 40 &&
		contrastRatio(hslToHex(accent), hslToHex(base)) < ACCENT_CONTRAST_TARGET;
		i++
	) {
		accent.l = clamp(accent.l + dir * 0.02, L_MIN, L_MAX);
	}
	return {
		base: hslToHex(base),
		sub: hslToHex(sub),
		accent: hslToHex(accent),
	};
}

// ─── 配色生成 ─────────────────────────────────────────────

/** 写真がほぼ無彩色とみなす彩度のしきい値 */
const ACHROMATIC_SAT = 0.08;
/** 無彩色写真の引き立てアクセントに使うブランドの暖色相（焚き火の炎） */
const WARM_FALLBACK_HUE = 24;

/** 3 ロールを「キーの色相 + アクセント HSL」から組み立てる */
function buildRoles(
	keyHue: number,
	keySat: number,
	accent: Hsl,
	mode: ThemeMode,
): OgRoles {
	const roles: OgRoles =
		mode === "light"
			? {
					base: hslToHex({
						h: keyHue,
						s: clamp(keySat * 0.6, 0.06, 0.45),
						l: 0.94,
					}),
					sub: hslToHex({
						h: keyHue,
						s: clamp(keySat * 0.5, 0.04, 0.3),
						l: 0.09,
					}),
					accent: hslToHex({
						h: accent.h,
						s: clamp(accent.s, 0, accentSatCap(accent.h)),
						l: clamp(accent.l, 0.28, 0.46),
					}),
				}
			: {
					base: hslToHex({
						h: keyHue,
						s: clamp(keySat * 0.5, 0.06, 0.35),
						l: 0.06,
					}),
					sub: hslToHex({
						h: keyHue,
						s: clamp(keySat * 0.4, 0.04, 0.3),
						l: 0.92,
					}),
					accent: hslToHex({
						h: accent.h,
						s: clamp(accent.s, 0, accentSatCap(accent.h)),
						l: clamp(accent.l, 0.56, 0.72),
					}),
				};
	return ensureReadable(roles, mode);
}

/**
 * キーカラー 1 色から「馴染ませ」「引き立て」の 2 案を生成する。
 * 馴染ませ＝写真と同系色でトーンを揃える。引き立て＝ベースは写真の色相のまま、
 * アクセントにキーカラーの反対色（補色）を置く（出典: 配色参考書 3 冊の整理）。
 */
export function buildPhotoPalettes(keyColor: string): PhotoPalette[] {
	const key = hexToHsl(keyColor);
	const achromatic = key.s < ACHROMATIC_SAT;

	// 馴染ませ: アクセントもキーカラーそのもの（彩度・明度はクランプ）
	const najimaseAccent: Hsl = { h: key.h, s: key.s, l: key.l };
	// 引き立て: アクセントは補色。無彩色写真は補色が定まらないので暖色に置く
	const hikitateAccent: Hsl = achromatic
		? { h: WARM_FALLBACK_HUE, s: 0.5, l: key.l }
		: { h: (key.h + 180) % 360, s: Math.max(key.s, 0.3), l: key.l };

	return [
		{
			id: "photo-najimase",
			label: "馴染ませ",
			light: buildRoles(key.h, key.s, najimaseAccent, "light"),
			dark: buildRoles(key.h, key.s, najimaseAccent, "dark"),
		},
		{
			id: "photo-hikitate",
			label: "引き立て",
			light: buildRoles(key.h, key.s, hikitateAccent, "light"),
			dark: buildRoles(key.h, key.s, hikitateAccent, "dark"),
		},
	];
}

// ─── ドミナントカラー抽出（ブラウザ専用） ──────────────────

/** 縮小 canvas の長辺サイズ。これ以上の解像度は配色決定に寄与しない */
const SAMPLE_SIZE = 48;
/** RGB 量子化のビット幅（4bit/ch → 4096 ビン） */
const QUANT_SHIFT = 4;

type Bin = { count: number; r: number; g: number; b: number };

/** ImageData からキーカラーを選ぶ。彩度が高く中間明度のビンを優先する */
function pickKeyColor(data: Uint8ClampedArray): string | null {
	const bins = new Map<number, Bin>();
	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] < 128) continue; // ほぼ透明は無視
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const k =
			((r >> QUANT_SHIFT) << 8) |
			((g >> QUANT_SHIFT) << 4) |
			(b >> QUANT_SHIFT);
		const bin = bins.get(k);
		if (bin) {
			bin.count++;
			bin.r += r;
			bin.g += g;
			bin.b += b;
		} else {
			bins.set(k, { count: 1, r, g, b });
		}
	}
	let best: { score: number; hex: string } | null = null;
	for (const bin of bins.values()) {
		const r = bin.r / bin.count;
		const g = bin.g / bin.count;
		const b = bin.b / bin.count;
		const { s, l } = rgbToHsl(r, g, b);
		// 占有面積 ×（彩度ボーナス）×（中間明度ボーナス）。
		// 白飛び・黒つぶれの大面積ビンに引っ張られないようにする。
		const score =
			bin.count * (0.15 + s) * Math.max(0.05, 1 - Math.abs(l - 0.5) * 1.6);
		if (!best || score > best.score) best = { score, hex: rgbToHex(r, g, b) };
	}
	return best?.hex ?? null;
}

/**
 * 画像（dataURL / URL）からキーカラーを抽出する。
 * SSR・デコード失敗・canvas 利用不可のときは null を返す（throw しない）。
 */
export function extractKeyColor(src: string): Promise<string | null> {
	if (typeof document === "undefined") return Promise.resolve(null);
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			try {
				const scale = SAMPLE_SIZE / Math.max(img.width, img.height, 1);
				const w = Math.max(1, Math.round(img.width * Math.min(1, scale)));
				const h = Math.max(1, Math.round(img.height * Math.min(1, scale)));
				const canvas = document.createElement("canvas");
				canvas.width = w;
				canvas.height = h;
				const ctx = canvas.getContext("2d", { willReadFrequently: true });
				if (!ctx) return resolve(null);
				ctx.drawImage(img, 0, 0, w, h);
				resolve(pickKeyColor(ctx.getImageData(0, 0, w, h).data));
			} catch {
				resolve(null);
			}
		};
		img.onerror = () => resolve(null);
		img.src = src;
	});
}

/** 画像から配色候補 2 案を生成する。抽出できなければ null */
export async function extractPhotoPalettes(
	src: string,
): Promise<PhotoPalette[] | null> {
	const key = await extractKeyColor(src);
	return key ? buildPhotoPalettes(key) : null;
}
