import {
	TplCover,
	TplEdition,
	TplFrame,
	TplQuiet,
	TplSplit,
	TplTate,
} from "./templates";
import type { TemplateDef } from "./types";

export const TEMPLATES = [
	{
		id: "edition",
		label: "01 Edition",
		note: "写真なし・号数＋大見出し",
		useImage: false,
		Comp: TplEdition,
	},
	{
		id: "cover",
		label: "02 Cover",
		note: "写真フルブリードの表紙",
		useImage: true,
		Comp: TplCover,
	},
	{
		id: "quiet",
		label: "03 Quiet",
		note: "余白多めの和モダン",
		useImage: "opt",
		Comp: TplQuiet,
	},
	{
		id: "frame",
		label: "04 Frame",
		note: "全面写真＋中央の枠ボックス",
		useImage: "opt",
		Comp: TplFrame,
	},
	{
		id: "split",
		label: "05 Split",
		note: "上下 2 トーン・濃色の情報バンド",
		useImage: "opt",
		Comp: TplSplit,
	},
	{
		id: "tate",
		label: "06 Tate",
		note: "縦書きタイトルの和モダン",
		useImage: false,
		Comp: TplTate,
	},
] as const satisfies readonly TemplateDef[];

export type { OgPalette, OgRoles, OgTheme } from "./palettes";
export {
	DEFAULT_PALETTE_ID,
	ogThemeFor,
	PALETTES,
	paletteById,
	resolveOgTheme,
} from "./palettes";
export type {
	CoverText,
	Fields,
	FontMode,
	PaletteId,
	TemplateDef,
	TemplateId,
	ThemeMode,
} from "./types";
