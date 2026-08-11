// og-templates の barrel はまだ v10 の列挙値を公開していないため、ここでは
// types.ts を直接読む（barrel への集約は後続の order で行う）。
import type { Fields, KumiId, Milestone, Mode } from "./og-templates/types";
import {
	KUMI_IDS as KUMI_ID_VALUES,
	MILESTONES as MILESTONE_VALUES,
	MODES as MODE_VALUES,
} from "./og-templates/types";

// localStorage は 5MB が一般的な上限。dataURL がそれを超えると quota error で
// 全フィールドの保存に失敗するので、画像のサイズが大きすぎる場合は保存対象から外す。
const MAX_IMAGE_BYTES = 1_500_000;

// v10 で shape が大きく変わったため、保存キーも :v4 に切る。
const STORAGE_KEY = "hidoko-note-ogp:v4";

// 旧キー。:v4 が無いときだけ読み、テキストとプロフィールを引き継ぐ。消さずに
// 放置するのは、古い版に戻したときに手入力が失われないようにするため。
const LEGACY_STORAGE_KEY = "hidoko-note-ogp:v3";

export const DEFAULTS: Fields = {
	title: "夜更けにコードを書く理由",
	issue: "013",
	date: "2026.05",
	brand: "焚き火を愛するエンジニア",
	author: "山本一将",
	account: "@kyamamoto9120",
	showMark: true,
	image: null,
	kumi: "a1",
	mode: "normal",
	milestone: "watermark",
	scrim: false,
};

// types.ts の const 配列を runtime validator に流用する。値を増やしたら
// types.ts 1 箇所だけ更新すれば、Set もこれを通して自動で拡張される。
const KUMI_IDS = new Set<KumiId>(KUMI_ID_VALUES);
const MILESTONES = new Set<Milestone>(MILESTONE_VALUES);
const MODES = new Set<Mode>(MODE_VALUES);

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

/** 保存済み JSON をオブジェクトとして読む。未保存・壊れた JSON はすべて null */
function readRaw(key: string): Record<string, unknown> | null {
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return null;
		const parsed: unknown = JSON.parse(raw);
		if (typeof parsed !== "object" || parsed === null) return null;
		return parsed as Record<string, unknown>;
	} catch {
		// JSON 破損・storage 無効。どちらも「保存されていない」に倒す
		return null;
	}
}

/** v3 と v10 で意味が変わらないフィールド（テキストとプロフィール） */
function pickCarriedOver(stored: Record<string, unknown>) {
	return {
		title: pickString(stored.title, DEFAULTS.title),
		issue: pickString(stored.issue, DEFAULTS.issue),
		date: pickString(stored.date, DEFAULTS.date),
		brand: pickString(stored.brand, DEFAULTS.brand),
		author: pickString(stored.author, DEFAULTS.author),
		account: pickString(stored.account, DEFAULTS.account),
		showMark: pickBool(stored.showMark, DEFAULTS.showMark),
		image: pickImage(stored.image),
	};
}

function parseFields(stored: Record<string, unknown>): Fields {
	return {
		...pickCarriedOver(stored),
		kumi: pickEnum(stored.kumi, KUMI_IDS, DEFAULTS.kumi),
		mode: pickEnum(stored.mode, MODES, DEFAULTS.mode),
		milestone: pickEnum(stored.milestone, MILESTONES, DEFAULTS.milestone),
		scrim: pickBool(stored.scrim, DEFAULTS.scrim),
	};
}

/**
 * v3 の state を v10 へ移す。引き継ぐのはテキストとプロフィールだけで、
 * 意匠（titleSlot / numberTreatment / numberOpts / 方向つき scrim）は v10 に
 * 対応する値が無いので DEFAULTS の組みで立ち上げる。
 */
function migrateFromLegacy(stored: Record<string, unknown>): Fields {
	return {
		...DEFAULTS,
		...pickCarriedOver(stored),
	};
}

/**
 * 保存済みの state があるかを確認する。useNoteOgpState 初期化時に「これは初回
 * 起動か？」を判定するために使う（DEFAULTS の date を当月に差し替えるかどうかの
 * 分岐に効く）。移行対象の v3 も「保存済み」として数える。
 */
export function hasStoredState(): boolean {
	if (typeof window === "undefined") return false;
	try {
		return (
			window.localStorage.getItem(STORAGE_KEY) !== null ||
			window.localStorage.getItem(LEGACY_STORAGE_KEY) !== null
		);
	} catch {
		return false;
	}
}

export function loadState(): Fields {
	if (typeof window === "undefined") return DEFAULTS;

	const current = readRaw(STORAGE_KEY);
	if (current) return parseFields(current);

	const legacy = readRaw(LEGACY_STORAGE_KEY);
	if (!legacy) return DEFAULTS;

	// 次回からは v4 だけを見れば済むように、移行結果をその場で保存する
	const migrated = migrateFromLegacy(legacy);
	saveState(migrated);
	return migrated;
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
