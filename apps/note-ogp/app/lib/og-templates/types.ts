import type { ComponentType } from "react";

export type ThemeMode = "light" | "dark";
export type FontMode = "serif" | "gothic" | "hand";
export type CoverText = "light" | "dark";
export type TemplateId = "edition" | "cover" | "quiet";
export type PaletteId =
	| "takibi"
	| "koke"
	| "geppaku"
	| "tetsusabi"
	| "suna"
	| "sumi"
	| "aikin"
	| "budou";

export type Fields = {
	templateId: TemplateId;
	theme: ThemeMode;
	palette: PaletteId;
	fontMode: FontMode;
	coverText: CoverText;
	title: string;
	lead: string;
	category: string;
	issue: string;
	date: string;
	brand: string;
	author: string;
	account: string;
	showMark: boolean;
	image: string | null;
};

export type TemplateDef = {
	id: TemplateId;
	label: string;
	note: string;
	/** true=主役, "opt"=任意, false=このテンプレでは未使用 */
	useImage: boolean | "opt";
	Comp: ComponentType<{ f: Fields }>;
};
