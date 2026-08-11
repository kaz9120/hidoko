import { DownloadIcon } from "lucide-react";
import { useId } from "react";
import { Button } from "ui";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "ui/components/accordion";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "ui/components/alert-dialog";
import {
	Field,
	FieldDescription,
	FieldLabel,
	FieldTitle,
} from "ui/components/field";
import { Input } from "ui/components/input";
import { Textarea } from "ui/components/textarea";
import type { Fields } from "~/lib/og-templates";
import { ImageField } from "./image-field";
import { KumiTiles, MilestoneTiles } from "./kumi-tiles";
import { SectionTitle } from "./section-title";
import { SegmentedToggle } from "./segmented-toggle";

/**
 * v10 の ControlPanel。「写真 → タイトル → 組み」の 3 手で完成する単一フロー。
 *
 * タイトルの居場所と号数の身振りを別々に選ばせるのはやめ、成立する組みだけを
 * 並べる。文字色・スクリムの向き・ハロは写真の輝度から台紙が決めるので、
 * ユーザーは意匠の判断をしない。
 *
 * 並び順：写真 → タイトル → vol. / 日付 → 号 → 組み → スクリム →
 * プロジェクト（連載の固定情報・accordion）。
 */
export function ControlPanel({
	state,
	update,
	reset,
	onDownload,
	busy,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	reset: () => void;
	onDownload: () => void;
	busy: boolean;
}) {
	return (
		<aside className="flex h-full flex-col overflow-hidden border-border border-l bg-card">
			<PanelHeader />
			<div className="flex-1 overflow-y-auto px-6 py-5">
				<PhotoSection state={state} update={update} />
				<TitleSection state={state} update={update} />
				<IssueSection state={state} update={update} />
				<ModeSection state={state} update={update} />
				<KumiSection state={state} update={update} />
				<ProjectSection state={state} update={update} />
			</div>
			<PanelFooter
				onDownload={onDownload}
				busy={busy}
				canDownload={!!state.title}
				onReset={reset}
			/>
		</aside>
	);
}

function PanelHeader() {
	return (
		<header className="flex-shrink-0 border-border border-b bg-card px-6 pt-5 pb-4">
			<div className="mb-1.5 flex items-center gap-2">
				<span
					aria-hidden="true"
					className="inline-block size-1.5 rounded-[1px] bg-primary"
				/>
				<span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
					note OGP
				</span>
				<span className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-faint)">
					v10 · kumi
				</span>
			</div>
			<h2 className="text-base font-bold text-foreground leading-tight">
				アイキャッチを作る
			</h2>
			<p className="mt-0.5 text-xs text-muted-foreground leading-[1.55]">
				写真 → タイトル → 組み の 3 手で仕上げる。
			</p>
		</header>
	);
}

// ── 写真 ──────────────────────────────────────────────
function PhotoSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	return (
		<>
			<SectionTitle>写真</SectionTitle>
			<Field className="mb-3.5">
				<ImageField
					value={state.image}
					onChange={(v) => update({ image: v })}
				/>
				<FieldDescription>
					明るさの判定・文字色・ハロは{" "}
					<span className="text-muted-foreground font-medium">全自動</span>。
					写真を替えるだけで組み直る。
				</FieldDescription>
			</Field>
		</>
	);
}

// ── タイトル ──────────────────────────────────────────
function TitleSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	const titleId = useId();
	return (
		<>
			<SectionTitle>タイトル</SectionTitle>
			<Field className="mb-3.5">
				<FieldLabel htmlFor={titleId} className="sr-only">
					タイトル
				</FieldLabel>
				<Textarea
					id={titleId}
					value={state.title}
					onChange={(e) => update({ title: e.target.value })}
					rows={2}
					placeholder="夜更けにコードを書く理由"
				/>
				<FieldDescription>
					{state.title.length}文字　·　改行は不要。詰めと折り返しは台紙が持つ。
				</FieldDescription>
			</Field>
		</>
	);
}

// ── vol. / 日付 ───────────────────────────────────────
function IssueSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	const issueId = useId();
	const dateId = useId();
	return (
		<>
			<SectionTitle>vol. / 日付</SectionTitle>
			<div className="mb-1 grid grid-cols-2 gap-2.5">
				<Field>
					<FieldLabel
						htmlFor={issueId}
						className="font-mono text-[10px] uppercase tracking-[0.22em]"
					>
						vol. 番号
					</FieldLabel>
					<Input
						id={issueId}
						value={state.issue}
						onChange={(e) =>
							update({ issue: e.target.value.replace(/[^\d]/g, "") })
						}
						placeholder="042"
						inputMode="numeric"
						className="font-mono"
					/>
				</Field>
				<Field>
					<FieldLabel
						htmlFor={dateId}
						className="font-mono text-[10px] uppercase tracking-[0.22em]"
					>
						日付
					</FieldLabel>
					<Input
						id={dateId}
						value={state.date}
						onChange={(e) => update({ date: e.target.value })}
						placeholder="2026.06"
						className="font-mono"
					/>
				</Field>
			</div>
		</>
	);
}

// ── 号（通常 / 節目）──────────────────────────────────
function ModeSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	return (
		<>
			<SectionTitle>号</SectionTitle>
			<Field className="mb-1">
				<SegmentedToggle
					label="号の種類"
					value={state.mode === "milestone"}
					offLabel="通常号"
					onLabel="節目号"
					onChange={(milestone) =>
						update({ mode: milestone ? "milestone" : "normal" })
					}
				/>
				<FieldDescription>
					節目号は号数が主役。10・25・50 のような節目で使う。
				</FieldDescription>
			</Field>
		</>
	);
}

// ── 組み（通常号）/ 節目の見せ方（節目号）─────────────
function KumiSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	const scrimLabelId = useId();
	if (state.mode === "milestone") {
		return (
			<>
				<SectionTitle>節目の見せ方</SectionTitle>
				<p className="mb-3 text-xs text-muted-foreground leading-relaxed">
					号数が主役の 3 変奏。タイトルは左下に回る。
				</p>
				<MilestoneTiles
					value={state.milestone}
					onSelect={(milestone) => update({ milestone })}
				/>
			</>
		);
	}
	return (
		<>
			<SectionTitle>組み</SectionTitle>
			<p className="mb-3 text-xs text-muted-foreground leading-relaxed">
				タイトルの居場所と号数の身振りは
				<span className="text-foreground font-medium">セット</span>
				。迷ったら{" "}
				<span className="text-foreground font-medium">H1 静けさ</span>
				。写真の静かな面を探して置く。
			</p>
			<KumiTiles value={state.kumi} onSelect={(kumi) => update({ kumi })} />
			<Field className="mt-4 mb-1">
				<FieldTitle
					id={scrimLabelId}
					className="font-mono text-[10px] uppercase tracking-[0.22em]"
				>
					スクリム（写真の上の暗幕）
				</FieldTitle>
				<SegmentedToggle
					labelledBy={scrimLabelId}
					value={state.scrim}
					offLabel="自動"
					onLabel="強制"
					onChange={(scrim) => update({ scrim })}
				/>
				<FieldDescription>
					自動で足りることが多い。敷く向きは組みが知っている。
				</FieldDescription>
			</Field>
		</>
	);
}

// ── プロジェクト（連載の固定情報）──────────────────
function ProjectSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	const brandId = useId();
	const markLabelId = useId();
	return (
		<Accordion type="single" collapsible className="mt-5">
			<AccordionItem value="project">
				<AccordionTrigger className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
					プロジェクト（連載の固定情報）
				</AccordionTrigger>
				<AccordionContent className="pt-2">
					<Field className="mb-3.5">
						<FieldLabel
							htmlFor={brandId}
							className="font-mono text-[10px] uppercase tracking-[0.22em]"
						>
							ブランド表記
						</FieldLabel>
						<Input
							id={brandId}
							value={state.brand}
							onChange={(e) => update({ brand: e.target.value })}
						/>
						<FieldDescription>マストヘッドに入る一言</FieldDescription>
					</Field>
					<Field>
						<FieldTitle
							id={markLabelId}
							className="font-mono text-[10px] uppercase tracking-[0.22em]"
						>
							炎マーク
						</FieldTitle>
						<SegmentedToggle
							labelledBy={markLabelId}
							value={!state.showMark}
							offLabel="表示"
							onLabel="非表示"
							onChange={(hidden) => update({ showMark: !hidden })}
						/>
					</Field>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

function PanelFooter({
	onDownload,
	busy,
	canDownload,
	onReset,
}: {
	onDownload: () => void;
	busy: boolean;
	canDownload: boolean;
	onReset: () => void;
}) {
	return (
		<footer className="flex flex-shrink-0 flex-col gap-2 border-border border-t bg-card px-6 pt-4 pb-5">
			<Button
				type="button"
				size="lg"
				onClick={onDownload}
				disabled={busy || !canDownload}
				className="w-full justify-between"
			>
				<span className="flex items-center gap-2">
					<DownloadIcon className="size-4" strokeWidth={1.75} />
					{busy ? "書き出し中…" : "PNG をダウンロード"}
				</span>
				<span className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">
					1280 × 670
				</span>
			</Button>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						type="button"
						variant="outline"
						className="w-full justify-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
					>
						リセット
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>入力内容をリセットする</AlertDialogTitle>
						<AlertDialogDescription>
							タイトル・vol.・組みの選択をすべて初期値に戻す。元には戻せない。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>キャンセル</AlertDialogCancel>
						<AlertDialogAction onClick={onReset}>リセット</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</footer>
	);
}
