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
		note: "写真が主役・配置 3 型",
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

export {
	JUMP_RATE_OPTIONS,
	SPACING_OPTIONS,
	spacingPx,
	subPx,
	titlePx,
} from "./expression";
export type { OgPalette, OgTheme } from "./palettes";
export {
	DEFAULT_PALETTE_ID,
	ogThemeFor,
	PALETTES,
	paletteById,
	paletteForSelection,
	resolveOgTheme,
} from "./palettes";
export {
	FOCAL_POINTS,
	focalObjectPosition,
	PHOTO_FILTERS,
	PHOTO_LAYOUTS,
	photoFilterCss,
	TEXT_GUARDS,
} from "./photo";
export { TextureLayer } from "./texture";
export { renderTitleLines, splitMerihari } from "./title-decoration";
export type {
	CoverText,
	Fields,
	FocalPoint,
	FontMode,
	JumpRate,
	OgRoles,
	PaletteId,
	PaletteSelection,
	PaperStrength,
	PhotoFilter,
	PhotoLayout,
	PhotoPalette,
	PhotoPaletteId,
	Spacing,
	TemplateDef,
	TemplateId,
	TextGuard,
	TextureId,
	ThemeMode,
	TitleDecoration,
} from "./types";
