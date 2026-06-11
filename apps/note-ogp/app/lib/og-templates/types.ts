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
/** 背景の質感。さじ加減は固定プリセット（不透明度の自由調整は出さない） */
export type TextureId = "none" | "paper" | "gradient" | "shape";
export type PaperStrength = "weak" | "medium";

/**
 * 配色の 3 ロール構造。
 * 参考書（『けっきょくは、よはく。』ほか）の「ベース 70% / サブ 25% /
 * アクセント 5%」に対応する。OGP 画像内の塗りはすべてこの 3 色から導出する。
 */
export type OgRoles = {
	/** ベース（≈70%）— 背景 */
	base: string;
	/** サブ（≈25%）— 文字 */
	sub: string;
	/** アクセント（≈5%）— 差し色 */
	accent: string;
};

/** 写真から抽出した動的パレットの id。プリセットの PaletteId とは重ならない */
export type PhotoPaletteId = "photo-najimase" | "photo-hikitate";

/** パレット選択値。プリセット or 写真由来の動的パレット */
export type PaletteSelection = PaletteId | PhotoPaletteId;

/**
 * 写真から抽出した動的パレット。プリセット（OgPalette）と同じ
 * 3 ロール × ライト / ダーク構造を持ち、色値ごと localStorage に保存される
 * （写真本体はサイズ超過で保存されないことがあるため、独立して持つ）。
 */
export type PhotoPalette = {
	id: PhotoPaletteId;
	label: string;
	light: OgRoles;
	dark: OgRoles;
};

export type Fields = {
	templateId: TemplateId;
	theme: ThemeMode;
	palette: PaletteSelection;
	/** 写真から抽出した配色候補。写真未設定なら null */
	photoPalettes: PhotoPalette[] | null;
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
	texture: TextureId;
	paperStrength: PaperStrength;
};

export type TemplateDef = {
	id: TemplateId;
	label: string;
	note: string;
	/** true=主役, "opt"=任意, false=このテンプレでは未使用 */
	useImage: boolean | "opt";
	Comp: ComponentType<{ f: Fields }>;
};
