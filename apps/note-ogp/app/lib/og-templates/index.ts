import { TplCover, TplEdition, TplQuiet } from "./templates";
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
] as const satisfies readonly TemplateDef[];

export type { OgPalette, OgTheme } from "./palettes";
export {
	DEFAULT_PALETTE_ID,
	ogThemeFor,
	PALETTES,
	paletteById,
	paletteForSelection,
	resolveOgTheme,
} from "./palettes";
export { TextureLayer } from "./texture";
export { renderTitleLines, splitMerihari } from "./title-decoration";
export type {
	CoverText,
	Fields,
	FontMode,
	OgRoles,
	PaletteId,
	PaletteSelection,
	PaperStrength,
	PhotoPalette,
	PhotoPaletteId,
	TemplateDef,
	TemplateId,
	TextureId,
	ThemeMode,
	TitleDecoration,
} from "./types";
