import { ArrowLeftIcon, ArrowRightIcon, DownloadIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button, ToggleGroup, ToggleGroupItem } from "ui";
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
import type {
	CoverText,
	Fields,
	FontMode,
	TemplateDef,
	TemplateId,
	ThemeMode,
} from "~/lib/og-templates";
import { TEMPLATES } from "~/lib/og-templates";
import {
	loadWizardStep,
	saveWizardStep,
	type WizardStep,
} from "~/lib/wizard-storage";
import { ExpressionField } from "./expression-field";
import { ImageField } from "./image-field";
import { PalettePicker } from "./palette-picker";
import { PhotoLayoutField } from "./photo-layout-field";
import { PhotoStyleField } from "./photo-style-field";
import { SectionTitle } from "./section-title";
import { TemplateThumb } from "./template-thumb";
import { TextureField } from "./texture-field";
import { TitleDecorationField } from "./title-decoration-field";

const STEPS: Array<{ id: WizardStep; label: string; description: string }> = [
	{ id: 1, label: "台紙", description: "テンプレートを選ぶ" },
	{ id: 2, label: "内容", description: "文字と画像を入れる" },
	{ id: 3, label: "仕上げ", description: "テーマ・書体・質感を整える" },
];

/**
 * ControlPanel を 3 ステップ（① 台紙 → ② 内容 → ③ 仕上げ）に再構成した
 * 三段ウィザード (Issue #136)。パネル上部に StepBar、フッターにステップ移動
 * ボタン (「戻る」/「次へ」)、③ にだけ PNG ダウンロード・リセットを置く。
 *
 * ステップ間を移動しても入力は保持される（現行の自動保存）。現在のステップ
 * 位置も localStorage で保存され、リロード後も同じステップに戻る。
 */
export function ControlPanel({
	state,
	update,
	reset,
	tpl,
	onDownload,
	busy,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	reset: () => void;
	tpl: TemplateDef;
	onDownload: () => void;
	busy: boolean;
}) {
	const [step, setStep] = useState<WizardStep>(1);

	useEffect(() => {
		setStep(loadWizardStep());
	}, []);
	useEffect(() => {
		saveWizardStep(step);
	}, [step]);

	const goPrev = () => setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s));
	const goNext = () => setStep((s) => (s < 3 ? ((s + 1) as WizardStep) : s));

	// 「リセット」は ③ 仕上げに置かれているが、リセット後は「新しい号を作る」
	// 状態に戻すので、ウィザードも ① 台紙からやり直すのが自然 (Issue #167)。
	// state.reset → setStep(1) の順で呼ぶ (step state は localStorage 永続化に
	// 載っているので、setStep(1) で次のリロードでも Step 1 で開く)。
	const handleReset = () => {
		reset();
		setStep(1);
	};

	return (
		<aside className="flex h-full flex-col overflow-hidden border-l border-border bg-card">
			<StepBar current={step} onSelect={setStep} />

			<div className="flex-1 overflow-y-auto px-6 py-5">
				{step === 1 && <Step1Mat state={state} update={update} />}
				{step === 2 && <Step2Content state={state} update={update} tpl={tpl} />}
				{step === 3 && <Step3Finish state={state} update={update} tpl={tpl} />}
			</div>

			<WizardFooter
				step={step}
				onPrev={goPrev}
				onNext={goNext}
				onDownload={onDownload}
				onReset={handleReset}
				busy={busy}
				canDownload={!!state.title}
			/>
		</aside>
	);
}

function StepBar({
	current,
	onSelect,
}: {
	current: WizardStep;
	onSelect: (step: WizardStep) => void;
}) {
	return (
		<div className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
			<div
				aria-label="入力ステップ"
				className="flex items-center gap-1"
				role="tablist"
			>
				{STEPS.map((s, i) => {
					const active = current === s.id;
					return (
						<button
							key={s.id}
							type="button"
							role="tab"
							aria-selected={active}
							onClick={() => onSelect(s.id)}
							className={`flex flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition-colors ${
								active
									? "border-primary/40 bg-primary/10 text-foreground"
									: "border-border bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground"
							}`}
						>
							<span
								className={`font-mono text-[11px] ${
									active ? "text-primary" : "text-(--text-faint)"
								}`}
							>
								{String(i + 1).padStart(2, "0")}
							</span>
							<span className="text-xs font-medium">{s.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function WizardFooter({
	step,
	onPrev,
	onNext,
	onDownload,
	onReset,
	busy,
	canDownload,
}: {
	step: WizardStep;
	onPrev: () => void;
	onNext: () => void;
	onDownload: () => void;
	onReset: () => void;
	busy: boolean;
	canDownload: boolean;
}) {
	if (step === 3) {
		return (
			<footer className="flex flex-shrink-0 flex-col gap-2 border-t border-border bg-card px-6 pt-4 pb-5">
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
					<span className="font-mono text-[10px] tracking-[0.22em] opacity-70">
						1280 × 670
					</span>
				</Button>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={onPrev}
						className="flex-1 justify-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
					>
						<ArrowLeftIcon
							aria-hidden="true"
							className="size-3.5"
							strokeWidth={1.75}
						/>
						戻る
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								variant="outline"
								className="flex-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
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
								<AlertDialogAction onClick={onReset}>
									リセット
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</footer>
		);
	}
	return (
		<footer className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-border bg-card px-6 pt-4 pb-5">
			<Button
				type="button"
				variant="outline"
				onClick={onPrev}
				disabled={step === 1}
				className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground"
			>
				<ArrowLeftIcon
					aria-hidden="true"
					className="size-3.5"
					strokeWidth={1.75}
				/>
				戻る
			</Button>
			<Button
				type="button"
				onClick={onNext}
				className="font-mono text-[11px] tracking-[0.16em]"
			>
				次へ
				<ArrowRightIcon
					aria-hidden="true"
					className="size-3.5"
					strokeWidth={1.75}
				/>
			</Button>
		</footer>
	);
}

// ── Step 1: 台紙 ──────────────────────────────────────
function Step1Mat({
	state,
	update,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
}) {
	return (
		<>
			<SectionTitle>テンプレート</SectionTitle>
			<p className="mb-3 text-xs text-muted-foreground">
				迷ったら 01。あとから変えても入力は残る。
			</p>
			<div className="mb-2 grid grid-cols-3 gap-2">
				{TEMPLATES.map((t) => (
					<TemplateThumb
						key={t.id}
						tpl={t}
						fields={state}
						active={t.id === state.templateId}
						onClick={() => update({ templateId: t.id as TemplateId })}
					/>
				))}
			</div>
		</>
	);
}

// ── Step 2: 内容 ──────────────────────────────────────
function Step2Content({
	state,
	update,
	tpl,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	tpl: TemplateDef;
}) {
	const titleId = useId();
	const leadId = useId();
	const categoryId = useId();
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
					{titleLength}文字　·　Enterで改行（自動折り返しなし）
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
				<FieldDescription>補足の一文</FieldDescription>
			</Field>

			<div className="mb-3.5 grid grid-cols-2 gap-2.5">
				<Field>
					<FieldLabel
						htmlFor={categoryId}
						className="font-mono text-[10px] uppercase tracking-[0.22em]"
					>
						カテゴリ
					</FieldLabel>
					<Input
						id={categoryId}
						value={state.category}
						onChange={(e) => update({ category: e.target.value })}
						placeholder="ESSAY"
						className="font-mono"
					/>
				</Field>
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
						placeholder="013"
						inputMode="numeric"
						className="font-mono"
					/>
				</Field>
			</div>

			<Field className="mb-3.5">
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
					placeholder="2026.05"
					className="font-mono"
				/>
				<FieldDescription>
					vol・日付は自動 — 書き出しごとに次号が初期値に乗る
				</FieldDescription>
			</Field>

			{(tpl.useImage === true || tpl.useImage === "opt") && (
				<>
					<SectionTitle annotation={<ImageHint useImage={tpl.useImage} />}>
						画像
					</SectionTitle>
					<ImageField
						value={state.image}
						onChange={(v) => update({ image: v })}
					/>
					<PhotoLayoutField state={state} update={update} tpl={tpl} />
					<PhotoStyleField state={state} update={update} tpl={tpl} />
				</>
			)}
		</>
	);
}

// ── Step 3: 仕上げ ────────────────────────────────────
function Step3Finish({
	state,
	update,
	tpl,
}: {
	state: Fields;
	update: (patch: Partial<Fields>) => void;
	tpl: TemplateDef;
}) {
	return (
		<>
			<SectionTitle>仕上げ</SectionTitle>
			<Field className="mb-3.5">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					テーマ
				</FieldLabel>
				<ToggleGroup
					type="single"
					variant="outline"
					value={state.theme}
					onValueChange={(v) => {
						if (v) update({ theme: v as ThemeMode });
					}}
					className="w-full"
				>
					<ToggleGroupItem value="dark" className="flex-1">
						ダーク
					</ToggleGroupItem>
					<ToggleGroupItem value="light" className="flex-1">
						ライト
					</ToggleGroupItem>
				</ToggleGroup>
			</Field>

			<Field className="mb-3.5">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					カラーパレット
				</FieldLabel>
				<PalettePicker
					value={state.palette}
					theme={state.theme}
					photoPalettes={state.photoPalettes}
					onChange={(palette) => update({ palette })}
				/>
				<FieldDescription>
					{state.photoPalettes
						? "ベース・文字・差し色の3色セット。上段は写真から抽出した提案"
						: "ベース・文字・差し色の3色セット"}
				</FieldDescription>
			</Field>

			<Field className="mb-3.5">
				<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
					タイトルの書体
				</FieldLabel>
				<ToggleGroup
					type="single"
					variant="outline"
					value={state.fontMode}
					onValueChange={(v) => {
						if (v) update({ fontMode: v as FontMode });
					}}
					className="w-full"
				>
					<ToggleGroupItem value="serif" className="flex-1">
						明朝
					</ToggleGroupItem>
					<ToggleGroupItem value="gothic" className="flex-1">
						ゴシック
					</ToggleGroupItem>
					<ToggleGroupItem value="hand" className="flex-1">
						手書き
					</ToggleGroupItem>
				</ToggleGroup>
				<FieldDescription>切り替わるのはタイトルだけ</FieldDescription>
			</Field>

			{tpl.id === "cover" && state.photoLayout === "full" && (
				<Field className="mb-3.5">
					<FieldLabel className="font-mono text-[10px] uppercase tracking-[0.22em]">
						表紙の文字色
					</FieldLabel>
					<ToggleGroup
						type="single"
						variant="outline"
						value={state.coverText}
						onValueChange={(v) => {
							if (v) update({ coverText: v as CoverText });
						}}
						className="w-full"
					>
						<ToggleGroupItem value="light" className="flex-1">
							白文字
						</ToggleGroupItem>
						<ToggleGroupItem value="dark" className="flex-1">
							黒文字
						</ToggleGroupItem>
					</ToggleGroup>
					<FieldDescription>画像の明るさに合わせて</FieldDescription>
				</Field>
			)}

			<Accordion type="multiple" className="mt-2">
				<AccordionItem value="texture-decoration">
					<AccordionTrigger className="font-mono text-[11px] uppercase tracking-[0.18em]">
						質感と装飾
					</AccordionTrigger>
					<AccordionContent className="pt-2">
						<TextureField
							state={state}
							update={update}
							unused={tpl.useImage === true && state.photoLayout === "full"}
						/>
						<TitleDecorationField state={state} update={update} />
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="text-rhythm">
					<AccordionTrigger className="font-mono text-[11px] uppercase tracking-[0.18em]">
						文字組（余白・ジャンプ率）
					</AccordionTrigger>
					<AccordionContent className="pt-2">
						<ExpressionField state={state} update={update} />
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</>
	);
}

function ImageHint({ useImage }: { useImage: TemplateDef["useImage"] }) {
	if (useImage === true) {
		return <span className="text-primary">·主役</span>;
	}
	if (useImage === "opt") {
		return <span className="text-muted-foreground">·任意</span>;
	}
	return (
		<span className="text-muted-foreground/70">·このテンプレでは未使用</span>
	);
}
