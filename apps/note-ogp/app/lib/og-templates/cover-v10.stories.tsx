import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import type { Fields, KumiId, Milestone } from "~/lib/og-templates";
import {
	Cover,
	FRAME_HEIGHT,
	FRAME_WIDTH,
	KUMI,
	KUMI_IDS,
	MILESTONE_NAMES,
	MILESTONES,
} from "~/lib/og-templates";
import { DEFAULTS } from "~/lib/storage";

/**
 * note OGP の台紙 v10（1280×670）。号ごとに選ぶのは「組み」だけで、
 * タイトルの居場所と号数の身振りはセットで動く。文字色・スクリム・ハロは
 * 写真の輝度から台紙が自動で決める。
 *
 * story では写真を渡さない（`image: null`）。フォールバックの熾火グラデーション
 * で描かれるので、組みごとの骨格だけを比べられる。号数と日付は固定値にして
 * VRT が日付や乱数で揺れないようにしてある。縮尺も、12 面が VRT の
 * ビューポート（1280×800）に収まる値に固定してある。
 *
 * @summary 台紙 v10（組み 12 種）
 */
const meta = {
	title: "note-ogp/Templates/CoverV10",
	component: Cover,
	parameters: { layout: "centered" },
	args: { f: base() },
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="dark">
				<Story />
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof Cover>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 台紙の外にある情報（現在時刻・乱数）に依存させない固定の Fields */
function base(patch: Partial<Fields> = {}): Fields {
	return {
		...DEFAULTS,
		title: "私が持っていない考えに、会いに行く",
		issue: "042",
		date: "2026.08",
		image: null,
		...patch,
	};
}

// 自動インク計画の 3 分岐を story で通すための合成写真。実写を出荷物に含めない
// ため、単色 1px の PNG を data URI で埋め込む。輝度は (0.2126R + 0.7152G +
// 0.0722B) / 255 なので、無彩色なら画素値がそのまま平均輝度になる。
//   #808080 → 0.502（中間調 = 自動スクリム）
//   #d9d9d9 → 0.851（明るい面 = ハロ）
// バイト列は固定なので VRT は揺れない。
const MID_TONE_PHOTO =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mNoaGgAAAMEAYF1LgG8AAAAAElFTkSuQmCC";
const BRIGHT_PHOTO =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mO4efMmAAUaAoyLTUsFAAAAAElFTkSuQmCC";

// 縮尺は VRT のビューポート（1280×800）に収まる値。12 面は 3 列 4 段なので
// いちばん小さく、単独と 2 面並びはその分だけ大きく見せる。
const SOLO_SCALE = 0.5;
const PAIR_SCALE = 0.45;
const TRIO_SCALE = 0.3;
const GRID_SCALE = 0.24;

/** 1 面ぶんの縮小プレビュー。上に組み名を添える */
function Panel({
	label,
	f,
	scale,
}: {
	label: string;
	f: Fields;
	scale: number;
}) {
	return (
		<figure className="m-0 flex flex-col gap-1">
			<figcaption className="font-mono text-[9px] uppercase leading-[1.2] tracking-[0.18em] text-muted-foreground">
				{label}
			</figcaption>
			<div
				className="overflow-hidden rounded-[3px] border border-border"
				style={{ width: FRAME_WIDTH * scale, height: FRAME_HEIGHT * scale }}
			>
				<div
					className="origin-top-left"
					style={{
						width: FRAME_WIDTH,
						height: FRAME_HEIGHT,
						transform: `scale(${scale})`,
					}}
				>
					<Cover f={f} />
				</div>
			</div>
		</figure>
	);
}

/** 面を並べる格子。列数ぶんの max-content で組み、はみ出させない */
function Grid({
	columns,
	children,
}: {
	columns: number;
	children: React.ReactNode;
}) {
	return (
		<div
			className="grid w-fit gap-3 p-2"
			style={{ gridTemplateColumns: `repeat(${columns}, max-content)` }}
		>
			{children}
		</div>
	);
}

/**
 * 既定の組み A1 定番。タイトルは左下、号数は右上のコーナー。
 * @summary A1 定番（既定）
 */
export const Default: Story = {
	render: () => (
		<Panel label={KUMI.a1.name} f={base({ kumi: "a1" })} scale={SOLO_SCALE} />
	),
};

/**
 * 組み 12 種のカタログ。タイトルの居場所と号数の身振りがセットで動くことを、
 * 同じタイトル・同じ号数で見比べられる。3 列 4 段で VRT のビューポートに
 * 全 12 面が収まるので、どれか 1 つが崩れれば差分に出る。
 * @summary 組み 12 種のカタログ
 */
export const AllKumi: Story = {
	render: () => (
		<Grid columns={3}>
			{KUMI_IDS.map((id: KumiId) => (
				<Panel
					key={id}
					label={KUMI[id].name}
					f={base({ kumi: id })}
					scale={GRID_SCALE}
				/>
			))}
		</Grid>
	),
};

/**
 * 節目号の 3 変奏。号数が主役になり、タイトルは左下に回る。
 * M4 漢数字は vol.50 を「第五十号」と組む。
 * @summary 節目号 3 変奏
 */
export const Milestones: Story = {
	render: () => (
		<Grid columns={3}>
			{MILESTONES.map((id: Milestone) => (
				<Panel
					key={id}
					label={MILESTONE_NAMES[id]}
					f={base({ mode: "milestone", milestone: id, issue: "050" })}
					scale={TRIO_SCALE}
				/>
			))}
		</Grid>
	),
};

/**
 * ポスター詰めの効き。左は鉤括弧と読点を含むタイトルで、約物が字形の分だけ
 * 詰まる。右は英数字を含むタイトルで、ラテンの連なりが Newsreader に切り替わり
 * 前後に四分アキが入る。どちらも同じ組み（A1 定番）で比べる。
 * @summary 詰め（約物とラテン）
 */
export const Tsume: Story = {
	render: () => (
		<Grid columns={2}>
			<Panel
				label="約物（「」と、。）"
				f={base({ kumi: "a1", title: "「静けさ」を、探しに行く。" })}
				scale={PAIR_SCALE}
			/>
			<Panel
				label="ラテンと数字"
				f={base({ kumi: "a1", title: "Rust と TypeScript で書いた 10 年" })}
				scale={PAIR_SCALE}
			/>
		</Grid>
	),
};

/**
 * 自動インク計画の 3 分岐。写真が無いときは暗い面として扱われてオフ白のまま、
 * 中間調（平均輝度 0.502）では自動でスクリムが敷かれ、明るい面（0.851）では
 * ハロ（黒淵の白）で文字を浮かせる。ユーザーはこの判断をしない。
 *
 * 写真は単色の合成画像なので、写真そのものではなく分岐の効きだけを見る。
 * @summary 自動インク計画（暗い / 中間調 / 明るい）
 */
export const InkPlan: Story = {
	render: () => (
		<Grid columns={3}>
			<Panel
				label="暗い（写真なし）"
				f={base({ kumi: "a1" })}
				scale={TRIO_SCALE}
			/>
			<Panel
				label="中間調 → 自動スクリム"
				f={base({ kumi: "a1", image: MID_TONE_PHOTO })}
				scale={TRIO_SCALE}
			/>
			<Panel
				label="明るい → ハロ"
				f={base({ kumi: "a1", image: BRIGHT_PHOTO })}
				scale={TRIO_SCALE}
			/>
		</Grid>
	),
};

/**
 * 明るい面のハロが、号数やマストヘッドなどの小物にも通っていることを見る。
 * 組みによって小物の位置と種類が変わるので、コーナー・フィルム縁・判・
 * 点線リーダーを 1 つずつ並べる。
 * @summary ハロ（明るい写真の上の小物）
 */
export const HaloOnBrightPhoto: Story = {
	render: () => (
		<Grid columns={2}>
			{(["a1", "c1", "d5", "g7"] as const).map((id) => (
				<Panel
					key={id}
					label={KUMI[id].name}
					f={base({ kumi: id, image: BRIGHT_PHOTO })}
					scale={PAIR_SCALE}
				/>
			))}
		</Grid>
	),
};

/**
 * スクリムを強制した状態。既定は自動で、写真が暗ければ敷かれない。
 * 敷く向きは組みが持っている（A1 定番なら左下）。
 *
 * F7 浮き帯は自動ではスクリムを敷かない。帯そのものが文字を守るからで、
 * 強制したときだけ帯のある下から敷く。
 * @summary スクリム強制
 */
export const ForcedScrim: Story = {
	render: () => (
		<Grid columns={2}>
			<Panel
				label="A1 自動（既定）"
				f={base({ kumi: "a1", scrim: false })}
				scale={PAIR_SCALE}
			/>
			<Panel
				label="A1 強制"
				f={base({ kumi: "a1", scrim: true })}
				scale={PAIR_SCALE}
			/>
			<Panel
				label="F7 自動（敷かない）"
				f={base({ kumi: "f7", scrim: false })}
				scale={PAIR_SCALE}
			/>
			<Panel
				label="F7 強制（下から）"
				f={base({ kumi: "f7", scrim: true })}
				scale={PAIR_SCALE}
			/>
		</Grid>
	),
};
