import { DownloadIcon } from "lucide-react";
import { useId } from "react";
import { Button, ToggleGroup, ToggleGroupItem } from "ui";
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
import { ExpressionField } from "./expression-field";
import { ImageField } from "./image-field";
import { PalettePicker } from "./palette-picker";
import { PhotoLayoutField } from "./photo-layout-field";
import { PhotoStyleField } from "./photo-style-field";
import { SectionTitle } from "./section-title";
import { TemplateThumb } from "./template-thumb";
import { TextureField } from "./texture-field";
import { TitleDecorationField } from "./title-decoration-field";

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
	const titleId = useId();
	const leadId = useId();
	const categoryId = useId();
	const issueId = useId();
	const dateId = useId();

	const titleLength = state.title.length;

	return (
		<aside className="flex h-full flex-col overflow-hidden border-l border-border bg-card">
			<div className="flex-1 overflow-y-auto px-6 py-5">
				<SectionTitle>テンプレート</SectionTitle>
				<div className="mb-6 grid grid-cols-3 gap-2">
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

				<TextureField
					state={state}
					update={update}
					unused={tpl.useImage === true && state.photoLayout === "full"}
				/>

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

				<TitleDecorationField state={state} update={update} />

				<ExpressionField state={state} update={update} />

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

				<SectionTitle annotation={<ImageHint useImage={tpl.useImage} />}>
					画像
				</SectionTitle>
				<ImageField
					value={state.image}
					onChange={(v) => update({ image: v })}
				/>
				<PhotoLayoutField state={state} update={update} tpl={tpl} />
				<PhotoStyleField state={state} update={update} tpl={tpl} />

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
			</div>

			<footer className="flex flex-shrink-0 flex-col gap-2 border-t border-border bg-card px-6 pt-4 pb-5">
				<Button
					type="button"
					size="lg"
					onClick={onDownload}
					disabled={busy || !state.title}
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
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							type="button"
							variant="outline"
							className="w-full font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
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
							<AlertDialogAction onClick={reset}>リセット</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</footer>
		</aside>
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
