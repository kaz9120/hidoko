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
 * VRT が日付で揺れないようにしてある。
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

const SCALE = 0.5;

/** 1 面ぶんの縮小プレビュー。上に組み名を添える */
function Panel({ label, f }: { label: string; f: Fields }) {
	return (
		<figure className="m-0 flex flex-col gap-1.5">
			<figcaption className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
				{label}
			</figcaption>
			<div
				className="overflow-hidden rounded-[4px] border border-border"
				style={{ width: FRAME_WIDTH * SCALE, height: FRAME_HEIGHT * SCALE }}
			>
				<div
					className="origin-top-left"
					style={{
						width: FRAME_WIDTH,
						height: FRAME_HEIGHT,
						transform: `scale(${SCALE})`,
					}}
				>
					<Cover f={f} />
				</div>
			</div>
		</figure>
	);
}

function Stack({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-5 p-4">{children}</div>;
}

/**
 * 既定の組み A1 定番。タイトルは左下、号数は右上のコーナー。
 * @summary A1 定番（既定）
 */
export const Default: Story = {
	render: () => <Panel label={KUMI.a1.name} f={base({ kumi: "a1" })} />,
};

/**
 * 組み 12 種を縦に並べたカタログ。タイトルの居場所と号数の身振りが
 * セットで動くことを、同じタイトル・同じ号数で見比べられる。
 * @summary 組み 12 種のカタログ
 */
export const AllKumi: Story = {
	render: () => (
		<Stack>
			{KUMI_IDS.map((id: KumiId) => (
				<Panel key={id} label={KUMI[id].name} f={base({ kumi: id })} />
			))}
		</Stack>
	),
};

/**
 * 節目号の 3 変奏。号数が主役になり、タイトルは左下に回る。
 * M4 漢数字は vol.50 を「第五十号」と組む。
 * @summary 節目号 3 変奏
 */
export const Milestones: Story = {
	render: () => (
		<Stack>
			{MILESTONES.map((id: Milestone) => (
				<Panel
					key={id}
					label={MILESTONE_NAMES[id]}
					f={base({ mode: "milestone", milestone: id, issue: "050" })}
				/>
			))}
		</Stack>
	),
};

/**
 * ポスター詰めの効き。上は鉤括弧と読点を含むタイトルで、約物が字形の分だけ
 * 詰まる。下は英数字を含むタイトルで、ラテンの連なりが Newsreader に切り替わり
 * 前後に四分アキが入る。どちらも同じ組み（A1 定番）で比べる。
 * @summary 詰め（約物とラテン）
 */
export const Tsume: Story = {
	render: () => (
		<Stack>
			<Panel
				label="約物（「」と、。）"
				f={base({
					kumi: "a1",
					title: "「静けさ」を、探しに行く。",
				})}
			/>
			<Panel
				label="ラテンと数字"
				f={base({
					kumi: "a1",
					title: "Rust と TypeScript で書いた 10 年",
				})}
			/>
		</Stack>
	),
};

/**
 * スクリムを強制した状態。既定は自動で、写真が暗ければ敷かれない。
 * 敷く向きは組みが持っている（A1 定番なら左下）。
 * @summary スクリム強制
 */
export const ForcedScrim: Story = {
	render: () => (
		<Stack>
			<Panel label="自動（既定）" f={base({ kumi: "a1", scrim: false })} />
			<Panel label="強制" f={base({ kumi: "a1", scrim: true })} />
		</Stack>
	),
};
