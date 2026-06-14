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
import { Field, FieldDescription, FieldLabel } from "ui/components/field";
import { Input } from "ui/components/input";
import { Textarea } from "ui/components/textarea";
import type { Fields, NumberTreatment, TitleSlot } from "~/lib/og-templates";
import { pickNumberCorner } from "~/lib/og-templates";
import { ImageField } from "./image-field";
import { NumberTreatmentTiles } from "./number-treatment-tiles";
import { ScrimToggle } from "./scrim-toggle";
import { SectionTitle } from "./section-title";
import { TitleSlotTiles } from "./title-slot-tiles";

/**
 * v3 の ControlPanel。「写真を主役に、タイトルの居場所と号数の見せ方を選ぶ」
 * の単一フロー。旧の三段ウィザード（台紙 → 内容 → 仕上げ）は廃止。
 *
 * 並び順：写真 → 内容 → タイトルの居場所 → 号数の身振り → スクリム / リード
 * 表示 → プロジェクト（連載の固定情報・accordion）。
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
				<ContentSection state={state} update={update} />
				<TitleSlotSection state={state} update={update} />
				<NumberTreatmentSection state={state} update={update} />
				<FinishSection state={state} update={update} />
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
					v3 · foundation
				</span>
			</div>
			<h2 className="text-base font-bold text-foreground leading-tight">
				アイキャッチを作る
			</h2>
			<p className="mt-0.5 text-xs text-muted-foreground leading-[1.55]">
				写真を主役に、タイトルの居場所と号数の見せ方を選ぶ。
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
					写真の <span className="text-muted-foreground font-medium">暗部</span>{" "}
					を見て、次の「タイトルの居場所」を選ぶ
				</FieldDescription>
			</Field>
		</>
	);
}

// ── 内容 ──────────────────────────────────────────────
function ContentSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	const titleId = useId();
	const leadId = useId();
	const issueId = useId();
	const dateId = useId();
	const titleLength = state.title.length;
	return (
		<>
			<SectionTitle>内容</SectionTitle>
			<Field className="mb-3.5">
				<FieldLabel
					htmlFor={titleId}
					className="font-mono text-[10px] uppercase tracking-[0.22em]"
				>
					タイトル
				</FieldLabel>
				<Textarea
					id={titleId}
					value={state.title}
					onChange={(e) => update({ title: e.target.value })}
					rows={3}
					placeholder={"夜更けに\nコードを書く理由"}
				/>
				<FieldDescription>
					{titleLength}文字　·　Enter で改行（自動折り返しなし）
				</FieldDescription>
			</Field>
			<Field className="mb-3.5">
				<FieldLabel
					htmlFor={leadId}
					className="font-mono text-[10px] uppercase tracking-[0.22em]"
				>
					リード（任意）
				</FieldLabel>
				<Textarea
					id={leadId}
					value={state.lead}
					onChange={(e) => update({ lead: e.target.value })}
					rows={2}
					placeholder="一行で添える、温度のある説明。"
				/>
			</Field>
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
						placeholder="014"
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

// ── タイトルの居場所 ──────────────────────────────────
function TitleSlotSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	return (
		<>
			<SectionTitle>タイトルの居場所</SectionTitle>
			<p className="mb-3 text-xs text-muted-foreground leading-relaxed">
				写真の <span className="text-foreground font-medium">暗部</span>{" "}
				に文字を置く。被写体が右なら左下（S1）、左なら右下（S2）。
			</p>
			<TitleSlotTiles
				state={state}
				onSelect={(slot: TitleSlot) =>
					// N1 Corner / N4 Plate を使っているとき、新しいタイトル位置に応じて
					// 号数のコーナーも追従させる（古い corner が残ってタイトルとぶつかる
					// のを避ける）。N2/N3/N5 は corner を見ないので無害。
					update({
						titleSlot: slot,
						numberOpts: {
							...state.numberOpts,
							corner: pickNumberCorner(slot),
						},
					})
				}
			/>
		</>
	);
}

// ── 号数の身振り ──────────────────────────────────────
function NumberTreatmentSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	const handleSelect = (treatment: NumberTreatment) => {
		update({
			numberTreatment: treatment,
			numberOpts: {
				corner: pickNumberCorner(state.titleSlot),
				side: "right",
				position: { left: 56, bottom: 92 },
			},
		});
	};
	return (
		<>
			<SectionTitle>号数の身振り</SectionTitle>
			<p className="mb-3 text-xs text-muted-foreground leading-relaxed">
				基本は <span className="text-foreground font-medium">N1 Corner</span>
				。雑誌的に押し出したいときだけ別の身振りを使う。
			</p>
			<NumberTreatmentTiles state={state} onSelect={handleSelect} />
			{state.numberTreatment === "watermark" && (
				<p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-(--warning)">
					<TriangleAlertIcon
						aria-hidden="true"
						className="mt-0.5 size-3.5 flex-shrink-0"
						strokeWidth={1.75}
					/>
					<span>
						<span className="font-medium">N5 Watermark は節目号専用。</span>{" "}
						通常号で使うと声が大きすぎる。
					</span>
				</p>
			)}
		</>
	);
}

// ── スクリム / リード表示 ─────────────────────────────
function FinishSection({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	return (
		<>
			<Field className="mt-5 mb-3.5">
				<FieldLabel className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]">
					スクリムの方向
					{state.scrim === "auto" && (
						<span className="inline-flex items-center gap-1 rounded-[2px] border border-primary/40 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.22em] text-primary">
							タイトルから推定
						</span>
					)}
				</FieldLabel>
				<ScrimToggle
					value={state.scrim}
					onChange={(scrim) => update({ scrim })}
				/>
				<FieldDescription>
					写真の上に重ねる暗部の方向。AUTO のままで足りることが多い。
				</FieldDescription>
			</Field>
			<Field className="mb-1">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					リード文の表示
				</FieldLabel>
				<div className="flex overflow-hidden rounded-md border border-border bg-input">
					<button
						type="button"
						aria-pressed={state.showLead}
						onClick={() => update({ showLead: true })}
						className={
							state.showLead
								? "flex-1 cursor-pointer bg-primary/15 px-2 py-2 text-sm text-primary"
								: "flex-1 cursor-pointer px-2 py-2 text-sm text-foreground hover:bg-accent/40"
						}
					>
						表示
					</button>
					<button
						type="button"
						aria-pressed={!state.showLead}
						onClick={() => update({ showLead: false })}
						className={
							!state.showLead
								? "flex-1 cursor-pointer border-border border-l bg-primary/15 px-2 py-2 text-sm text-primary"
								: "flex-1 cursor-pointer border-border border-l px-2 py-2 text-sm text-foreground hover:bg-accent/40"
						}
					>
						非表示
					</button>
				</div>
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
	const authorId = useId();
	const accountId = useId();
	const categoryId = useId();
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
					</Field>
					<div className="mb-3.5 grid grid-cols-2 gap-2.5">
						<Field>
							<FieldLabel
								htmlFor={authorId}
								className="font-mono text-[10px] uppercase tracking-[0.22em]"
							>
								名前
							</FieldLabel>
							<Input
								id={authorId}
								value={state.author}
								onChange={(e) => update({ author: e.target.value })}
							/>
						</Field>
						<Field>
							<FieldLabel
								htmlFor={accountId}
								className="font-mono text-[10px] uppercase tracking-[0.22em]"
							>
								アカウント
							</FieldLabel>
							<Input
								id={accountId}
								value={state.account}
								onChange={(e) => update({ account: e.target.value })}
								className="font-mono"
							/>
						</Field>
					</div>
					<Field className="mb-3.5">
						<FieldLabel
							htmlFor={categoryId}
							className="font-mono text-[10px] uppercase tracking-[0.22em]"
						>
							カテゴリ（任意）
						</FieldLabel>
						<Input
							id={categoryId}
							value={state.category}
							onChange={(e) => update({ category: e.target.value })}
							placeholder="ESSAY"
							className="font-mono"
						/>
						<FieldDescription>
							v3 では基本表示しない。N4 Plate を選んだときだけ補足情報に使う。
						</FieldDescription>
					</Field>
					<Field>
						<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
							炎マーク
						</FieldLabel>
						<div className="flex overflow-hidden rounded-md border border-border bg-input">
							<button
								type="button"
								aria-pressed={state.showMark}
								onClick={() => update({ showMark: true })}
								className={
									state.showMark
										? "flex-1 cursor-pointer bg-primary/15 px-2 py-2 text-sm text-primary"
										: "flex-1 cursor-pointer px-2 py-2 text-sm text-foreground hover:bg-accent/40"
								}
							>
								表示
							</button>
							<button
								type="button"
								aria-pressed={!state.showMark}
								onClick={() => update({ showMark: false })}
								className={
									!state.showMark
										? "flex-1 cursor-pointer border-border border-l bg-primary/15 px-2 py-2 text-sm text-primary"
										: "flex-1 cursor-pointer border-border border-l px-2 py-2 text-sm text-foreground hover:bg-accent/40"
								}
							>
								非表示
							</button>
						</div>
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
							タイトル・リード・著者などの入力をすべて初期値に戻す。元には戻せない。
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
