import { DownloadIcon, TriangleAlertIcon } from "lucide-react";
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
import type { Fields } from "~/lib/og-templates";
import { getTitleWarning } from "~/lib/title-readability";
import { DateField } from "./date-field";
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
 * 並び順：写真 → タイトル（号数と日付を含む）→ レイアウト（通常 / 節目の
 * 切替とタイル、暗幕）→ プロジェクト（連載の固定情報・accordion）。
 */
export function ControlPanel({
	state,
	update,
	reset,
	onDownload,
	busy,
	titleFontSize,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	reset: () => void;
	onDownload: () => void;
	busy: boolean;
	/** 台紙が確定したタイトルのフォントサイズ。可読性の警告に使う */
	titleFontSize: number | null;
}) {
	return (
		<aside className="flex h-full flex-col overflow-hidden border-border border-l bg-card">
			<div className="flex-1 overflow-y-auto px-6 py-5">
				<PhotoSection state={state} update={update} />
				<TitleSection
					state={state}
					update={update}
					titleFontSize={titleFontSize}
				/>
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

// 和文の判定に使う範囲（かな・カタカナ・漢字・全角記号・半角カナ）
const CJK = /[　-ヿ㐀-鿿豈-﫿ｦ-ﾟ]/;

/**
 * 貼り付けで混ざった改行を畳む。台紙が禁則つきで折るので、タイトルに改行は
 * 要らない。和文どうしは詰め、欧文の語が隣り合うときだけ空白でつなぐ
 * （「夜更けに\nコードを書く」に空白が入ると台紙に隙間として出るため）。
 */
export function collapseTitleNewlines(value: string): string {
	return value.replace(/[ \t]*\r?\n[ \t]*/g, (match, offset: number) => {
		const before = value[offset - 1] ?? "";
		const after = value[offset + match.length] ?? "";
		if (!before || !after) return "";
		return CJK.test(before) || CJK.test(after) ? "" : " ";
	});
}

/** 号数は数字だけ。全角で打たれても半角に直してから受ける */
export function normalizeIssue(value: string): string {
	return value
		.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
		.replace(/[^\d]/g, "");
}

function TitleSection({
	state,
	update,
	titleFontSize,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	titleFontSize: number | null;
}) {
	const titleId = useId();
	// タイトルがタイムラインで潰れるときだけ出す。直せる場所はここ
	const warning = state.title ? getTitleWarning(titleFontSize) : null;
	return (
		<>
			<SectionTitle>タイトル</SectionTitle>
			<Field className="mb-3.5">
				<FieldLabel htmlFor={titleId} className="sr-only">
					タイトル
				</FieldLabel>
				<Input
					id={titleId}
					value={state.title}
					onChange={(e) =>
						update({ title: collapseTitleNewlines(e.target.value) })
					}
					placeholder="夜更けにコードを書く理由"
				/>
				<div className="flex items-start gap-3">
					{warning && (
						<p
							role="status"
							className="flex items-start gap-1.5 text-xs leading-relaxed text-(--warning)"
						>
							<TriangleAlertIcon
								aria-hidden="true"
								className="mt-0.5 size-3.5 flex-shrink-0"
								strokeWidth={1.75}
							/>
							<span>{warning.message}</span>
						</p>
					)}
					<FieldDescription className="ml-auto shrink-0 tabular-nums">
						{state.title.length}文字
					</FieldDescription>
				</div>
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
						号数
					</FieldLabel>
					<Input
						id={issueId}
						value={state.issue}
						onChange={(e) => update({ issue: normalizeIssue(e.target.value) })}
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
					<DateField
						id={dateId}
						value={state.date}
						onChange={(date) => update({ date })}
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
						<AlertDialogTitle>はじめから作り直す</AlertDialogTitle>
						<AlertDialogDescription>
							写真が消え、タイトル・号数・日付・レイアウト・プロフィールが初期値に戻る。写真は元に戻せない
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
