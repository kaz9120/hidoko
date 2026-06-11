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

export type {
	CoverText,
	Fields,
	FontMode,
	TemplateDef,
	TemplateId,
	ThemeMode,
} from "./types";
