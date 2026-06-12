import type {
	CoverText,
	Fields,
	FocalPoint,
	FontMode,
	OgRoles,
	PaletteId,
	PaletteSelection,
	PaperStrength,
	PhotoLayout,
	PhotoPalette,
	PhotoPaletteId,
	TemplateId,
	TextureId,
	ThemeMode,
	TitleDecoration,
} from "./og-templates";
import { DEFAULT_PALETTE_ID, FOCAL_POINTS, PALETTES } from "./og-templates";

const STORAGE_KEY = "hidoko-note-ogp:v1";

// localStorage は 5MB が一般的な上限。dataURL がそれを超えると quota error で
// 全フィールドの保存に失敗するので、画像のサイズが大きすぎる場合は保存対象から外す。
const MAX_IMAGE_BYTES = 1_500_000;

export const DEFAULTS: Fields = {
	templateId: "edition",
	theme: "light",
	palette: DEFAULT_PALETTE_ID,
	fontMode: "serif",
	coverText: "light",
	title: "夜更けにコードを書く理由",
	lead: "",
	category: "ESSAY",
	issue: "013",
	date: "2026.05",
	brand: "焚き火を愛するエンジニア",
	author: "山本一将",
	account: "@kyamamoto9120",
	showMark: true,
	image: null,
	texture: "none",
	paperStrength: "weak",
	photoPalettes: null,
	titleDecoration: "none",
	photoLayout: "full",
	focalPoint: "center",
	photoMirror: false,
};

const TEMPLATE_IDS = new Set<TemplateId>(["edition", "cover", "quiet"]);
const THEMES = new Set<ThemeMode>(["light", "dark"]);
const PALETTE_IDS = new Set<PaletteId>(PALETTES.map((p) => p.id));
const FONT_MODES = new Set<FontMode>(["serif", "gothic", "hand"]);
const COVER_TEXTS = new Set<CoverText>(["light", "dark"]);
const TEXTURE_IDS = new Set<TextureId>(["none", "paper", "gradient", "shape"]);
const PAPER_STRENGTHS = new Set<PaperStrength>(["weak", "medium"]);
const TITLE_DECORATIONS = new Set<TitleDecoration>([
	"none",
	"merihari",
	"zurashi",
	"hanzure",
]);
const PHOTO_LAYOUT_IDS = new Set<PhotoLayout>(["full", "edge", "kakuhan"]);
const FOCAL_POINT_IDS = new Set<FocalPoint>(FOCAL_POINTS);

function pickEnum<T extends string>(
	value: unknown,
	allowed: Set<T>,
	fallback: T,
): T {
	return typeof value === "string" && allowed.has(value as T)
		? (value as T)
		: fallback;
}

function pickString(value: unknown, fallback: string): string {
	return typeof value === "string" ? value : fallback;
}

function pickBool(value: unknown, fallback: boolean): boolean {
	return typeof value === "boolean" ? value : fallback;
}

function pickImage(value: unknown): string | null {
	if (typeof value !== "string") return null;
	if (!value.startsWith("data:image/")) return null;
	return value;
}

const PHOTO_PALETTE_IDS = new Set<PhotoPaletteId>([
	"photo-najimase",
	"photo-hikitate",
]);
const HEX_RE = /^#[0-9a-f]{6}$/i;

function pickRoles(value: unknown): OgRoles | null {
	if (typeof value !== "object" || value === null) return null;
	const v = value as Record<string, unknown>;
	const hex = (x: unknown): x is string =>
		typeof x === "string" && HEX_RE.test(x);
	if (!hex(v.base) || !hex(v.sub) || !hex(v.accent)) return null;
	return { base: v.base, sub: v.sub, accent: v.accent };
}

/**
 * 写真由来パレットの復元。写真本体（dataURL）はサイズ超過で保存されないことが
 * あるため、パレットは色値ごと独立して保存・復元する。1 件でも壊れていたら
 * 全体を捨てる（候補が中途半端に欠けた状態を作らない）。
 */
function pickPhotoPalettes(value: unknown): PhotoPalette[] | null {
	if (!Array.isArray(value) || value.length === 0) return null;
	const result: PhotoPalette[] = [];
	const seen = new Set<PhotoPaletteId>();
	for (const item of value) {
		if (typeof item !== "object" || item === null) return null;
		const v = item as Record<string, unknown>;
		const id = v.id;
		if (
			typeof id !== "string" ||
			!PHOTO_PALETTE_IDS.has(id as PhotoPaletteId) ||
			seen.has(id as PhotoPaletteId)
		) {
			return null;
		}
		const light = pickRoles(v.light);
		const dark = pickRoles(v.dark);
		if (!light || !dark || typeof v.label !== "string") return null;
		seen.add(id as PhotoPaletteId);
		result.push({ id: id as PhotoPaletteId, label: v.label, light, dark });
	}
	return result;
}

export function loadState(): Fields {
	if (typeof window === "undefined") return DEFAULTS;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULTS;
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		const photoPalettes = pickPhotoPalettes(parsed.photoPalettes);
		// 選択可能なパレット = プリセット + 復元できた写真由来パレット
		const selectable = new Set<PaletteSelection>([
			...PALETTE_IDS,
			...(photoPalettes?.map((p) => p.id) ?? []),
		]);
		return {
			templateId: pickEnum(
				parsed.templateId,
				TEMPLATE_IDS,
				DEFAULTS.templateId,
			),
			theme: pickEnum(parsed.theme, THEMES, DEFAULTS.theme),
			// パレットキーを持たない既存データは焚き火（現行配色）にフォールバック
			palette: pickEnum(parsed.palette, selectable, DEFAULTS.palette),
			fontMode: pickEnum(parsed.fontMode, FONT_MODES, DEFAULTS.fontMode),
			coverText: pickEnum(parsed.coverText, COVER_TEXTS, DEFAULTS.coverText),
			title: pickString(parsed.title, DEFAULTS.title),
			lead: pickString(parsed.lead, DEFAULTS.lead),
			category: pickString(parsed.category, DEFAULTS.category),
			issue: pickString(parsed.issue, DEFAULTS.issue),
			date: pickString(parsed.date, DEFAULTS.date),
			brand: pickString(parsed.brand, DEFAULTS.brand),
			author: pickString(parsed.author, DEFAULTS.author),
			account: pickString(parsed.account, DEFAULTS.account),
			showMark: pickBool(parsed.showMark, DEFAULTS.showMark),
			image: pickImage(parsed.image),
			// 質感キーを持たない既存データは「なし」（現行の単色ベタ）にフォールバック
			texture: pickEnum(parsed.texture, TEXTURE_IDS, DEFAULTS.texture),
			paperStrength: pickEnum(
				parsed.paperStrength,
				PAPER_STRENGTHS,
				DEFAULTS.paperStrength,
			),
			photoPalettes,
			// 装飾キーを持たない既存データは「なし」（現行どおり）にフォールバック
			titleDecoration: pickEnum(
				parsed.titleDecoration,
				TITLE_DECORATIONS,
				DEFAULTS.titleDecoration,
			),
			// 配置・注視点キーを持たない既存データは全面・中央（現行の構図）に
			photoLayout: pickEnum(
				parsed.photoLayout,
				PHOTO_LAYOUT_IDS,
				DEFAULTS.photoLayout,
			),
			focalPoint: pickEnum(
				parsed.focalPoint,
				FOCAL_POINT_IDS,
				DEFAULTS.focalPoint,
			),
			photoMirror: pickBool(parsed.photoMirror, DEFAULTS.photoMirror),
		};
	} catch {
		return DEFAULTS;
	}
}

export function saveState(state: Fields): void {
	if (typeof window === "undefined") return;
	try {
		const persisted: Fields = {
			...state,
			image:
				state.image && state.image.length > MAX_IMAGE_BYTES
					? null
					: state.image,
		};
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
	} catch {
		// quota error 等は黙って捨てる。次回ロード時には DEFAULTS が出るだけ
	}
}
