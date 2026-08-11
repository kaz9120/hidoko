import { cn } from "ui/lib/utils";
import type { KumiId, Milestone } from "~/lib/og-templates";
import { KUMI_IDS, MILESTONES } from "~/lib/og-templates";

/**
 * レイアウト（内部識別子は kumi）のセレクタ。実写プレビューではなく矩形の抽象で
 * 示す。
 *
 * 12 種を実写で並べると写真の印象が勝ち、レイアウトの違い（タイトルの居場所と
 * 号数の身振りの関係）が読み取れない。灰の矩形がマストヘッドとタイトル、ember の
 * 矩形が号数、淡い ember が面と大判を表す。名前は面に出さず、矩形だけを比べる。
 *
 * 矩形の座標はタイルのためだけに作った近似で、台紙の KUMI の座標とは別物。
 * 台紙側を動かしたときは、ここも目で見て合わせる（自動では追従しない）。
 */

/** 矩形の役割。ink=文字の塊 / ember=号数 / wash=面・大判 */
type Ink = "ink" | "ember" | "wash";

/** [役割, 左%, 上%, 幅%, 高さ%] */
type Rect = [Ink, number, number, number, number];

// ember は台紙の号数がその色で刷られていることの写しで、UI のアクセント
// （CTA・リンク・フォーカスリング）として広げているわけではない。ここを灰に
// すると号数の矩形がタイトルの矩形と見分けられず、タイルが伝える情報が消える。
// 選択状態はタイルのボーダーとグローで示し、面の中とは層を分けてある。
const KIND_CLASS: Record<Ink, string> = {
	ink: "bg-(--text-faint)",
	ember: "bg-primary",
	wash: "bg-primary/25",
};

/** マストヘッド。全タイル共通で左上に置く */
const MASTHEAD: Rect = ["ink", 7, 8, 20, 5];

const KUMI_SKELETONS: Record<KumiId, Rect[]> = {
	a1: [
		MASTHEAD,
		["ink", 7, 60, 48, 10],
		["ink", 7, 75, 38, 10],
		["ember", 86, 10, 7, 13],
	],
	b1: [MASTHEAD, ["ink", 7, 22, 80, 11], ["ember", 78, 80, 15, 11]],
	b7: [
		MASTHEAD,
		["ink", 45, 20, 48, 10],
		["ink", 55, 34, 38, 10],
		["ember", 7, 78, 7, 13],
	],
	c1: [
		MASTHEAD,
		["ink", 86, 16, 6, 66],
		["ink", 76, 16, 6, 48],
		["ember", 4.5, 14, 1.2, 72],
	],
	c11: [MASTHEAD, ["ember", 46.5, 10, 7, 12], ["ink", 47, 28, 6, 54]],
	d5: [
		["ink", 40, 8, 20, 5],
		["ink", 24, 40, 52, 10],
		["ink", 32, 54, 36, 10],
		["ember", 46.5, 74, 7, 13],
	],
	d6: [MASTHEAD, ["wash", 36, 26, 28, 48], ["ink", 22, 48, 56, 10]],
	e7: [
		MASTHEAD,
		["ink", 13, 40, 44, 10],
		["ink", 13, 54, 34, 10],
		["ember", 94.3, 14, 1.2, 72],
	],
	f7: [
		MASTHEAD,
		["wash", 3, 72, 94, 22],
		["ink", 8, 79, 40, 9],
		["ember", 82, 79, 8, 9],
	],
	g7: [
		MASTHEAD,
		["ink", 7, 76, 40, 9],
		["wash", 49, 80, 28, 1.5],
		["ember", 84, 74, 7, 11],
	],
	g10: [MASTHEAD, ["ink", 7, 20, 52, 10], ["wash", 55, 40, 45, 60]],
	h1: [MASTHEAD, ["ink", 34, 48, 40, 10], ["ember", 76, 50, 5, 7]],
};

const MILESTONE_SKELETONS: Record<Milestone, Rect[]> = {
	watermark: [
		MASTHEAD,
		["wash", -4, -8, 50, 90],
		["ink", 7, 60, 48, 10],
		["ink", 7, 75, 38, 10],
	],
	hero: [
		MASTHEAD,
		["ember", 55, 30, 45, 72],
		["ink", 7, 60, 42, 10],
		["ink", 7, 74, 32, 10],
	],
	kanji: [
		MASTHEAD,
		["ember", 86, 18, 7, 60],
		["ink", 7, 60, 44, 10],
		["ink", 7, 75, 34, 10],
	],
};

// 読み上げ用の名前。矩形だけでは何を選んでいるか分からないので button に持たせる。
// 台紙側の KUMI[id].name が持つ記号（A1 / B1 …）は設計時の符牒なので使わない。
const KUMI_LABELS: Record<KumiId, string> = {
	a1: "定番",
	b1: "見出し",
	b7: "上段右",
	c1: "右柱",
	c11: "中柱",
	d5: "扉",
	d6: "中央大判",
	e7: "重心外し",
	f7: "浮き帯",
	g7: "目次風",
	g10: "対角巨大",
	h1: "静けさ",
};

const MILESTONE_LABELS: Record<Milestone, string> = {
	watermark: "透かし",
	hero: "主役",
	kanji: "漢数字",
};

/** 通常号のレイアウト 12 種 */
export function KumiTiles({
	value,
	onSelect,
}: {
	value: KumiId;
	onSelect: (id: KumiId) => void;
}) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{KUMI_IDS.map((id) => (
				<Tile
					key={id}
					active={value === id}
					label={KUMI_LABELS[id]}
					rects={KUMI_SKELETONS[id]}
					onClick={() => onSelect(id)}
				/>
			))}
		</div>
	);
}

/** 節目号の 3 変奏。通常号のタイルと同じ場所・同じ作法で選ぶ */
export function MilestoneTiles({
	value,
	onSelect,
}: {
	value: Milestone;
	onSelect: (id: Milestone) => void;
}) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{MILESTONES.map((id) => (
				<Tile
					key={id}
					active={value === id}
					label={MILESTONE_LABELS[id]}
					rects={MILESTONE_SKELETONS[id]}
					onClick={() => onSelect(id)}
				/>
			))}
		</div>
	);
}

function Tile({
	active,
	label,
	rects,
	onClick,
}: {
	active: boolean;
	label: string;
	rects: Rect[];
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			aria-label={label}
			className={cn(
				"relative aspect-[1280/670] cursor-pointer overflow-hidden rounded-md border bg-muted p-0 outline-none transition-colors",
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
				"active:translate-y-px",
				active
					? "border-primary shadow-[var(--glow-ember)]"
					: "border-border hover:border-muted-foreground/60",
			)}
		>
			{rects.map(([kind, left, top, width, height]) => (
				<span
					key={`${kind}-${left}-${top}-${width}-${height}`}
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute rounded-[1px]",
						KIND_CLASS[kind],
					)}
					style={{
						left: `${left}%`,
						top: `${top}%`,
						width: `${width}%`,
						height: `${height}%`,
					}}
				/>
			))}
		</button>
	);
}
