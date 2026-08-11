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
 * v10 の ControlPanel。写真 → タイトル → レイアウト の 3 手で完成する単一フロー。
 *
 * タイトルの居場所と号数の身振りを別々に選ばせるのはやめ、成立する組みだけを
 * 並べる。文字色・スクリムの向き・ハロは写真の輝度から台紙が決めるので、
 * ユーザーは意匠の判断をしない。手順や自動処理を画面で説明せず、操作そのもので
 * 伝える（説明文を置くとユーザーは読んでから触ることになる）。
 *
 * 並び順：写真 → タイトル（vol. と日付を含む）→ レイアウト（通常 / 節目の
 * 切替とタイル、暗幕）→ プロジェクト（連載の固定情報・accordion）。
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
			<div className="flex-1 overflow-y-auto px-6 py-5">
				<PhotoSection state={state} update={update} />
				<TitleSection state={state} update={update} />
				<IssueSection state={state} update={update} />
				<LayoutSection state={state} update={update} />
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
				<FieldDescription>{state.title.length}文字</FieldDescription>
			</Field>
		</>
	);
}

// ── vol. / 日付（見出しは置かない。各入力のラベルで足りる）─────
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

// ── レイアウト ────────────────────────────────────────
//   通常 / 節目の切替をタイルの真上に置く。切り替えると同じ場所のタイルが
//   入れ替わるので、2 つの関係は文字で説明しなくても動きで伝わる。
function LayoutSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	const dimLabelId = useId();
	const milestone = state.mode === "milestone";
	return (
		<>
			<SectionTitle>レイアウト</SectionTitle>
			<Field className="mb-3">
				<SegmentedToggle
					label="号の種類"
					value={milestone}
					offLabel="通常"
					onLabel="節目"
					onChange={(next) => update({ mode: next ? "milestone" : "normal" })}
				/>
			</Field>
			{milestone ? (
				<MilestoneTiles
					value={state.milestone}
					onSelect={(next) => update({ milestone: next })}
				/>
			) : (
				<>
					<KumiTiles value={state.kumi} onSelect={(kumi) => update({ kumi })} />
					<Field className="mt-4 mb-1">
						<FieldTitle
							id={dimLabelId}
							className="font-mono text-[10px] uppercase tracking-[0.22em]"
						>
							暗幕
						</FieldTitle>
						<SegmentedToggle
							labelledBy={dimLabelId}
							value={state.scrim}
							offLabel="自動"
							onLabel="常に敷く"
							onChange={(scrim) => update({ scrim })}
						/>
					</Field>
				</>
			)}
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
				className="w-full justify-center"
			>
				<span className="flex items-center gap-2">
					<DownloadIcon className="size-4" strokeWidth={1.75} />
					{busy ? "書き出し中…" : "PNG をダウンロード"}
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
							タイトル・vol.・レイアウトの選択をすべて初期値に戻す。元には戻せない。
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
