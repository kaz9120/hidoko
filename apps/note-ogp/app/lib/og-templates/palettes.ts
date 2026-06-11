import type {
	OgRoles,
	PaletteId,
	PaletteSelection,
	PhotoPalette,
	ThemeMode,
} from "./types";

// ─────────────────────────────────────────────────────────
// 配色の 3 ロール構造（OgRoles）は types.ts に定義がある。
//   OGP 画像内の塗りはすべて base / sub / accent の 3 色から導出し、
//   自由なカラーピッカーは出さない（色の盛りすぎを構造的に防ぐ）。
//   写真からの色抽出（photo-palette.ts）も OgRoles を組み立てて
//   resolveOgTheme に渡すことで同じ構造に乗る。
// ─────────────────────────────────────────────────────────
export type { OgRoles } from "./types";

export type OgPalette = {
	id: PaletteId;
	label: string;
	light: OgRoles;
	dark: OgRoles;
};

/**
 * OGP 画像内の塗りに使う 6 トークン。
 * CSS 変数や color-mix() は使わず、すべて確定済みの hex / rgba 文字列にする
 * — html-to-image での解決失敗を避けるため。
 */
export type OgTheme = {
	bg: string;
	text: string;
	muted: string;
	faint: string;
	rule: string;
	ruleStrong: string;
	accent: string;
};

// ─────────────────────────────────────────────────────────
// hex 演算ヘルパー（JS 側で混色を確定させるので書き出し PNG にもそのまま乗る）
// ─────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
	let n = hex.replace("#", "");
	if (n.length === 3) {
		n = n
			.split("")
			.map((c) => c + c)
			.join("");
	}
	return [
		Number.parseInt(n.slice(0, 2), 16),
		Number.parseInt(n.slice(2, 4), 16),
		Number.parseInt(n.slice(4, 6), 16),
	];
}

/** a と b を t : (1 - t) で混色した hex を返す（t=1 で a） */
export function mixHex(a: string, b: string, t: number): string {
	const ra = hexToRgb(a);
	const rb = hexToRgb(b);
	const ch = (i: number) =>
		Math.round(ra[i] * t + rb[i] * (1 - t))
			.toString(16)
			.padStart(2, "0");
	return `#${ch(0)}${ch(1)}${ch(2)}`;
}

/** hex に alpha を乗せた rgba() 文字列を返す */
export function rgbaFromHex(hex: string, alpha: number): string {
	const [r, g, b] = hexToRgb(hex);
	return `rgba(${r},${g},${b},${alpha})`;
}

// sub→base の混色比。焚き火パレットで現行 6 トークンとほぼ同一になるよう調整済み。
const MIX_RATIOS: Record<
	ThemeMode,
	{ muted: number; faint: number; rule: number; ruleStrong: number }
> = {
	light: { muted: 0.66, faint: 0.44, rule: 0.15, ruleStrong: 0.26 },
	dark: { muted: 0.59, faint: 0.37, rule: 0.11, ruleStrong: 0.21 },
};

/** 3 ロールから OGP 用の 6 トークンを導出する */
export function resolveOgTheme(roles: OgRoles, mode: ThemeMode): OgTheme {
	const r = MIX_RATIOS[mode];
	return {
		bg: roles.base,
		text: roles.sub,
		muted: mixHex(roles.sub, roles.base, r.muted),
		faint: mixHex(roles.sub, roles.base, r.faint),
		rule: mixHex(roles.sub, roles.base, r.rule),
		ruleStrong: mixHex(roles.sub, roles.base, r.ruleStrong),
		accent: roles.accent,
	};
}

// ─────────────────────────────────────────────────────────
// 名前付きパレット
//   どのパレットも DESIGN.md の禁則（純白 / 純黒 / 高彩度の緑・青）を守り、
//   sub と base のコントラスト比は light / dark とも 13:1 以上（WCAG AA の
//   4.5:1 を大きく上回る）であることを計算で確認済み。
// ─────────────────────────────────────────────────────────
export const PALETTES = [
	{
		id: "takibi",
		label: "焚き火",
		light: { base: "#f7f2e8", sub: "#1b1610", accent: "#bd4718" },
		dark: { base: "#13100c", sub: "#f3ede1", accent: "#f47d3a" },
	},
	{
		id: "koke",
		label: "苔",
		light: { base: "#f1f2e6", sub: "#1d2014", accent: "#5a6b3c" },
		dark: { base: "#12140c", sub: "#ecefdf", accent: "#a9bc80" },
	},
	{
		id: "geppaku",
		label: "月白",
		light: { base: "#eef1f3", sub: "#171c22", accent: "#48606f" },
		dark: { base: "#0f1216", sub: "#e7ecf0", accent: "#a9bdcd" },
	},
	{
		id: "tetsusabi",
		label: "鉄錆",
		light: { base: "#f4ede6", sub: "#221712", accent: "#96401f" },
		dark: { base: "#16100d", sub: "#f0e6df", accent: "#d07e57" },
	},
	{
		id: "suna",
		label: "砂",
		light: { base: "#f5efe1", sub: "#2a2317", accent: "#8a6a36" },
		dark: { base: "#17130d", sub: "#efe8d7", accent: "#c9a368" },
	},
	{
		id: "sumi",
		label: "墨",
		light: { base: "#f2f1ed", sub: "#191918", accent: "#52524d" },
		dark: { base: "#131312", sub: "#ebeae6", accent: "#a3a39b" },
	},
	{
		id: "aikin",
		label: "藍金",
		light: { base: "#edeff4", sub: "#161c2c", accent: "#8f7227" },
		dark: { base: "#10141f", sub: "#e9ecf2", accent: "#d4af5e" },
	},
	{
		id: "budou",
		label: "葡萄",
		light: { base: "#f3eef0", sub: "#241820", accent: "#7c4660" },
		dark: { base: "#171013", sub: "#f0e7ec", accent: "#c08da6" },
	},
] as const satisfies readonly OgPalette[];

export const DEFAULT_PALETTE_ID: PaletteId = "takibi";

/** id からパレットを引く。未知の id は焚き火にフォールバックする */
export function paletteById(id: string): OgPalette {
	return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

/** パレット id × テーマモードから 6 トークンを得るショートカット */
export function ogThemeFor(id: PaletteId, mode: ThemeMode): OgTheme {
	return resolveOgTheme(paletteById(id)[mode], mode);
}

/**
 * パレット選択値（プリセット or 写真由来）から light / dark 両面のロールを引く。
 * 写真パレットが選択されているのに候補が無い（写真と一緒に消えた等）場合は
 * 焚き火にフォールバックする。
 */
export function paletteForSelection(
	selection: PaletteSelection,
	photoPalettes: PhotoPalette[] | null | undefined,
): Pick<OgPalette, "light" | "dark"> {
	if (selection.startsWith("photo-")) {
		const found = photoPalettes?.find((p) => p.id === selection);
		return found ?? paletteById(DEFAULT_PALETTE_ID);
	}
	return paletteById(selection);
}
