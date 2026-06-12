/**
 * 注釈の重なり順 (z-order) を種別横断で扱う純粋関数群 (#105)。
 *
 * 各注釈は数値の `zIndex` を持ち、全種別をまとめて zIndex 昇順に並べた順が
 * そのまま「下 → 上」になる。描画 (image-stage / image-export) と hit test
 * (annotation-hit-test) はすべてこの並びを共有する。
 *
 * 初期値は「種別バンド + セッション内の単調増加 seq」。バンドは従来のレイヤー
 * 構造 (rect < arrow < text < highlight) を踏襲するので、z 操作を一度もして
 * いないドキュメントの重なりは従来とまったく同じになる。z 操作 (前面へ /
 * 背面へ) は隣接要素の間の中間値を取る fractional indexing で、対象 1 件の
 * zIndex だけを書き換える — 既存の update op 1 つに載るので undo も 1 回で
 * 戻る。
 */

import type { AnnotationHit, AnnotationLists } from "~/lib/annotation-hit-test";
import type { RectAnnotation } from "~/lib/rect-engine";

/** 注釈の種別 (= AnnotationHit["kind"])。 */
export type AnnotationKind = AnnotationHit["kind"];

/**
 * 種別バンドの幅。同一バンド内でセッション中に 2^20 個を超える注釈を作ると
 * 隣のバンドに食い込むが、手作業のスクリーンショット注釈では現実的に
 * 到達しない。
 */
const Z_BAND = 2 ** 20;

/** 種別ごとのバンド基準値。従来のレイヤー構造の順序をそのまま数値化する。 */
export const Z_BAND_BASE: Record<AnnotationKind, number> = {
	rect: 0,
	arrow: Z_BAND,
	text: 2 * Z_BAND,
	highlight: 3 * Z_BAND,
};

let zSeq = 0;

/**
 * 新規注釈の zIndex を採番する。種別バンドの基準値 + セッション内で単調増加
 * する seq。seq は種別をまたいで共有するが、バンドが種別を分離するので
 * 「新しい注釈は同種別の中で最前・他種別とはレイヤー構造どおり」になる。
 * 状態は持ち回らない (注釈は永続化されず、セッション内の大小関係だけが意味を
 * 持つ)。
 */
export function initialZIndex(kind: AnnotationKind): number {
	zSeq += 1;
	return Z_BAND_BASE[kind] + zSeq;
}

/**
 * z 比較器。zIndex → createdAt → id の順で比較し、全順序を保証する。
 * (fractional indexing が精度限界で同値になった場合も並びが不定にならない)
 */
export function compareByZIndex(
	a: Pick<AnnotationHit, "zIndex" | "createdAt" | "id">,
	b: Pick<AnnotationHit, "zIndex" | "createdAt" | "id">,
): number {
	if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
	if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
	return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** 全種別の注釈を 1 本のリストに合流し、zIndex 昇順 (下 → 上) で返す。 */
export function sortAnnotationsByZ(lists: AnnotationLists): AnnotationHit[] {
	return [
		...lists.annotations,
		...lists.arrows,
		...lists.texts,
		...lists.highlights,
	].sort(compareByZIndex);
}

/**
 * z 順リストを「同種別が連続する区間 (run)」に分割する。image-stage は
 * run ごとに既存のレイヤーコンポーネント (SVG / canvas) を積み、image-export
 * は run ごとに既存の draw 関数を呼ぶ — z 操作をしていないドキュメントでは
 * run が種別ごとに 1 つずつになり、従来のレイヤー構成と一致する。
 */
export type AnnotationRun =
	| { kind: "rect"; items: RectAnnotation[] }
	| { kind: "arrow"; items: Extract<AnnotationHit, { kind: "arrow" }>[] }
	| { kind: "text"; items: Extract<AnnotationHit, { kind: "text" }>[] }
	| {
			kind: "highlight";
			items: Extract<AnnotationHit, { kind: "highlight" }>[];
	  };

export function groupAnnotationRuns(
	ordered: readonly AnnotationHit[],
): AnnotationRun[] {
	const runs: AnnotationRun[] = [];
	for (const item of ordered) {
		const last = runs.at(-1);
		if (last && last.kind === item.kind) {
			// kind が一致していることを確認済みなので items の要素型も一致する
			(last.items as AnnotationHit[]).push(item);
		} else {
			runs.push({ kind: item.kind, items: [item] } as AnnotationRun);
		}
	}
	return runs;
}

/** z 操作 1 回ぶんの結果。該当種別の update (patch: { zIndex }) に流す。 */
export type ZOrderPatch = {
	kind: AnnotationKind;
	id: string;
	zIndex: number;
};

/**
 * a < b の中間値を返す。浮動小数の精度限界で a と b の間に表現できる値が
 * ない場合は null (呼び側で操作を no-op にする)。
 */
function between(a: number, b: number): number | null {
	const mid = a + (b - a) / 2;
	return mid > a && mid < b ? mid : null;
}

function findIndexById(ordered: readonly AnnotationHit[], id: string): number {
	return ordered.findIndex((a) => a.id === id);
}

function toPatch(target: AnnotationHit, zIndex: number): ZOrderPatch {
	return { kind: target.kind, id: target.id, zIndex };
}

/** 1 段前面へ。すでに最前面なら null。 */
export function bringForwardPatch(
	lists: AnnotationLists,
	id: string,
): ZOrderPatch | null {
	const ordered = sortAnnotationsByZ(lists);
	const i = findIndexById(ordered, id);
	if (i < 0 || i >= ordered.length - 1) return null;
	const above = ordered[i + 1];
	const aboveAbove = ordered.at(i + 2);
	const next =
		aboveAbove === undefined
			? above.zIndex + 1
			: between(above.zIndex, aboveAbove.zIndex);
	return next === null ? null : toPatch(ordered[i], next);
}

/** 1 段背面へ。すでに最背面なら null。 */
export function sendBackwardPatch(
	lists: AnnotationLists,
	id: string,
): ZOrderPatch | null {
	const ordered = sortAnnotationsByZ(lists);
	const i = findIndexById(ordered, id);
	if (i <= 0) return null;
	const below = ordered[i - 1];
	const belowBelow = i >= 2 ? ordered[i - 2] : undefined;
	const next =
		belowBelow === undefined
			? below.zIndex - 1
			: between(belowBelow.zIndex, below.zIndex);
	return next === null ? null : toPatch(ordered[i], next);
}

/** 最前面へ。すでに最前面なら null。 */
export function bringToFrontPatch(
	lists: AnnotationLists,
	id: string,
): ZOrderPatch | null {
	const ordered = sortAnnotationsByZ(lists);
	const i = findIndexById(ordered, id);
	if (i < 0 || i >= ordered.length - 1) return null;
	return toPatch(ordered[i], ordered[ordered.length - 1].zIndex + 1);
}

/** 最背面へ。すでに最背面なら null。 */
export function sendToBackPatch(
	lists: AnnotationLists,
	id: string,
): ZOrderPatch | null {
	const ordered = sortAnnotationsByZ(lists);
	const i = findIndexById(ordered, id);
	if (i <= 0) return null;
	return toPatch(ordered[i], ordered[0].zIndex - 1);
}
