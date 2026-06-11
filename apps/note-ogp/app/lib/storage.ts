import type {
	CoverText,
	Fields,
	FontMode,
	PaletteId,
	TemplateId,
	ThemeMode,
} from "./og-templates";
import { DEFAULT_PALETTE_ID, PALETTES } from "./og-templates";

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
};

const TEMPLATE_IDS = new Set<TemplateId>([
	"edition",
	"cover",
	"quiet",
	"frame",
	"split",
	"tate",
]);
const THEMES = new Set<ThemeMode>(["light", "dark"]);
const PALETTE_IDS = new Set<PaletteId>(PALETTES.map((p) => p.id));
const FONT_MODES = new Set<FontMode>(["serif", "gothic", "hand"]);
const COVER_TEXTS = new Set<CoverText>(["light", "dark"]);

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

export function loadState(): Fields {
	if (typeof window === "undefined") return DEFAULTS;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULTS;
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		return {
			templateId: pickEnum(
				parsed.templateId,
				TEMPLATE_IDS,
				DEFAULTS.templateId,
			),
			theme: pickEnum(parsed.theme, THEMES, DEFAULTS.theme),
			// パレットキーを持たない既存データは焚き火（現行配色）にフォールバック
			palette: pickEnum(parsed.palette, PALETTE_IDS, DEFAULTS.palette),
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
