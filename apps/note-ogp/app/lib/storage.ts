import type {
	Fields,
	NumberCorner,
	NumberSide,
	NumberTreatment,
	Scrim,
	TitleSlot,
} from "./og-templates";
import {
	NUMBER_CORNERS as NUMBER_CORNER_VALUES,
	NUMBER_SIDES as NUMBER_SIDE_VALUES,
	NUMBER_TREATMENTS as NUMBER_TREATMENT_VALUES,
	SCRIMS as SCRIM_VALUES,
	TITLE_SLOTS as TITLE_SLOT_VALUES,
} from "./og-templates";

// localStorage は 5MB が一般的な上限。dataURL がそれを超えると quota error で
// 全フィールドの保存に失敗するので、画像のサイズが大きすぎる場合は保存対象から外す。
const MAX_IMAGE_BYTES = 1_500_000;

// v3 で shape が大きく変わったため、保存キーも :v3 に切る。旧キー (:v1) は
// 自然に放置 — DEFAULTS で安全に立ち上がる。
const STORAGE_KEY = "hidoko-note-ogp:v3";

export const DEFAULTS: Fields = {
	title: "夜更けに\nコードを書く理由",
	lead: "手の動きを邪魔しない、夜の道具立てについて。",
	issue: "013",
	date: "2026.05",
	category: "ESSAY",
	brand: "焚き火を愛するエンジニア",
	author: "山本一将",
	account: "@kyamamoto9120",
	showMark: true,
	image: null,
	titleSlot: "bl",
	numberTreatment: "corner",
	numberOpts: { corner: "tr" },
	scrim: "auto",
	showLead: true,
};

// types.ts の const 配列を runtime validator に流用する。値を増やしたら
// types.ts 1 箇所だけ更新すれば、Set もこれを通して自動で拡張される。
const TITLE_SLOTS = new Set<TitleSlot>(TITLE_SLOT_VALUES);
const NUMBER_TREATMENTS = new Set<NumberTreatment>(NUMBER_TREATMENT_VALUES);
const NUMBER_CORNERS = new Set<NumberCorner>(NUMBER_CORNER_VALUES);
const NUMBER_SIDES = new Set<NumberSide>(NUMBER_SIDE_VALUES);
const SCRIMS = new Set<Scrim>(SCRIM_VALUES);

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

function pickNumberOpts(value: unknown): Fields["numberOpts"] {
	if (typeof value !== "object" || value === null) return DEFAULTS.numberOpts;
	const v = value as Record<string, unknown>;
	const opts: Fields["numberOpts"] = {};
	if (
		typeof v.corner === "string" &&
		NUMBER_CORNERS.has(v.corner as NumberCorner)
	) {
		opts.corner = v.corner as NumberCorner;
	}
	if (typeof v.side === "string" && NUMBER_SIDES.has(v.side as NumberSide)) {
		opts.side = v.side as NumberSide;
	}
	if (
		typeof v.position === "object" &&
		v.position !== null &&
		Number.isFinite((v.position as Record<string, unknown>).left) &&
		Number.isFinite((v.position as Record<string, unknown>).bottom)
	) {
		const p = v.position as Record<string, number>;
		opts.position = { left: p.left, bottom: p.bottom };
	}
	return opts;
}

/**
 * localStorage に v3 の state が保存済みかを確認する。useNoteOgpState 初期化時
 * に「これは初回起動か？」を判定するために使う（DEFAULTS の date を当月に
 * 差し替えるかどうかの分岐に効く）。
 */
export function hasStoredState(): boolean {
	if (typeof window === "undefined") return false;
	try {
		return window.localStorage.getItem(STORAGE_KEY) !== null;
	} catch {
		return false;
	}
}

export function loadState(): Fields {
	if (typeof window === "undefined") return DEFAULTS;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULTS;
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		return {
			title: pickString(parsed.title, DEFAULTS.title),
			lead: pickString(parsed.lead, DEFAULTS.lead),
			issue: pickString(parsed.issue, DEFAULTS.issue),
			date: pickString(parsed.date, DEFAULTS.date),
			category: pickString(parsed.category, DEFAULTS.category),
			brand: pickString(parsed.brand, DEFAULTS.brand),
			author: pickString(parsed.author, DEFAULTS.author),
			account: pickString(parsed.account, DEFAULTS.account),
			showMark: pickBool(parsed.showMark, DEFAULTS.showMark),
			image: pickImage(parsed.image),
			titleSlot: pickEnum(parsed.titleSlot, TITLE_SLOTS, DEFAULTS.titleSlot),
			numberTreatment: pickEnum(
				parsed.numberTreatment,
				NUMBER_TREATMENTS,
				DEFAULTS.numberTreatment,
			),
			numberOpts: pickNumberOpts(parsed.numberOpts),
			scrim: pickEnum(parsed.scrim, SCRIMS, DEFAULTS.scrim),
			showLead: pickBool(parsed.showLead, DEFAULTS.showLead),
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
