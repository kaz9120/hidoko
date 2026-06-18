import {
	Grid2X2Icon,
	SettingsIcon,
	SquareIcon,
	SquareStackIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	Button,
	ToggleGroup,
	ToggleGroupItem,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "ui";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "ui/components/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "ui/components/dialog";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import {
	PRESET_COLORS,
	type RectDefaults,
	type RectStyle,
	type RectThickness,
} from "~/lib/rect-engine";

const STYLE_OPTIONS: ReadonlyArray<{
	id: RectStyle;
	label: string;
	icon: typeof SquareIcon;
}> = [
	{ id: "outline", label: "枠線", icon: SquareIcon },
	{ id: "fill", label: "塗り", icon: SquareStackIcon },
	{ id: "mosaic", label: "モザイク", icon: Grid2X2Icon },
];

const THICKNESS_OPTIONS: ReadonlyArray<{
	id: RectThickness;
	barHeight: number;
}> = [
	{ id: "sm", barHeight: 1 },
	{ id: "md", barHeight: 2.5 },
	{ id: "lg", barHeight: 5 },
];

/**
 * ヘッダ右クラスタの設定ボタンと、それが開く設定ダイアログ。最初の中身は
 * 矩形ツールのデフォルト値 (スタイル / 色 / 太さ)。保存すると
 * `SnapcropContext` 経由で rect-defaults-storage.ts の localStorage に永続化
 * される。
 *
 * UX 上の守り (StatusItemDialog の先例に揃える):
 *   - 外タップは preventDefault で抑止し、閉じる経路を X / キャンセル /
 *     Esc / 保存完了に限定する
 *   - 編集途中 (dirty) で閉じようとしたら「変更を破棄しますか?」を
 *     AlertDialog で確認する。dirty でなければ即座に閉じる
 *
 * 選択コントロールは「スタイルと太さは ToggleGroup、色は円形スウォッチ」で
 * 統一。mosaic では色が、fill では太さが意味を持たないため disable する。
 */
export function SettingsDialog() {
	const { rectDefaults, setRectDefaults } = useSnapcrop();
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState<RectDefaults>(rectDefaults);
	const [confirmDiscard, setConfirmDiscard] = useState(false);

	// 開くたびに保存済みの値からフォームを初期化する
	useEffect(() => {
		if (open) {
			setDraft(rectDefaults);
			setConfirmDiscard(false);
		}
	}, [open, rectDefaults]);

	const dirty =
		draft.style !== rectDefaults.style ||
		draft.color !== rectDefaults.color ||
		draft.thickness !== rectDefaults.thickness;

	const attemptClose = () => {
		if (dirty) {
			setConfirmDiscard(true);
		} else {
			setOpen(false);
		}
	};

	const save = () => {
		setRectDefaults(draft);
		setOpen(false);
	};

	const colorDisabled = draft.style === "mosaic";
	const thicknessDisabled = draft.style === "fill";
	const thicknessLabel = draft.style === "mosaic" ? "ブロック" : "太さ";

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						aria-label="設定"
						onClick={() => setOpen(true)}
						size="icon"
						variant="ghost"
					>
						<SettingsIcon strokeWidth={1.75} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>設定</TooltipContent>
			</Tooltip>

			<Dialog
				onOpenChange={(next) => {
					// 開く方向は素通し。閉じる方向は dirty チェック経由。
					if (next) setOpen(true);
					else attemptClose();
				}}
				open={open}
			>
				<DialogContent
					className="max-w-sm"
					onEscapeKeyDown={(e) => {
						e.preventDefault();
						attemptClose();
					}}
					// 外タップでは閉じない。編集途中の設定を黙って破棄しないため。
					onPointerDownOutside={(e) => e.preventDefault()}
				>
					<DialogHeader>
						<DialogTitle>設定</DialogTitle>
						<DialogDescription>
							新しく描く矩形のデフォルト値。描画済みの矩形には影響しません。
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-4">
						<SettingRow label="スタイル">
							<ToggleGroup
								aria-label="矩形スタイル"
								onValueChange={(next) => {
									if (next) setDraft({ ...draft, style: next as RectStyle });
								}}
								type="single"
								value={draft.style}
								variant="outline"
							>
								{STYLE_OPTIONS.map((opt) => {
									const Icon = opt.icon;
									return (
										<ToggleGroupItem key={opt.id} size="sm" value={opt.id}>
											<Icon strokeWidth={1.75} />
											<span>{opt.label}</span>
										</ToggleGroupItem>
									);
								})}
							</ToggleGroup>
						</SettingRow>

						<SettingRow label="色">
							<div
								className="inline-flex items-center gap-1.5"
								style={{ opacity: colorDisabled ? 0.35 : 1 }}
							>
								{PRESET_COLORS.map((c) => {
									const active = draft.color.toLowerCase() === c.toLowerCase();
									return (
										<button
											aria-label={`色 ${c}`}
											aria-pressed={active}
											className={`size-[18px] cursor-pointer rounded-full border-[1.5px] p-0 transition-transform not-disabled:hover:scale-110 disabled:cursor-not-allowed ${
												active
													? "border-foreground shadow-[0_0_0_1.5px_var(--background)]"
													: "border-transparent"
											}`}
											disabled={colorDisabled}
											key={c}
											onClick={() => setDraft({ ...draft, color: c })}
											style={{ background: c }}
											type="button"
										/>
									);
								})}
							</div>
						</SettingRow>

						<SettingRow label={thicknessLabel}>
							<ToggleGroup
								aria-label="太さ"
								disabled={thicknessDisabled}
								onValueChange={(next) => {
									if (next) {
										setDraft({ ...draft, thickness: next as RectThickness });
									}
								}}
								type="single"
								value={draft.thickness}
								variant="outline"
							>
								{THICKNESS_OPTIONS.map((opt) => (
									<ToggleGroupItem
										key={opt.id}
										size="sm"
										title={`太さ ${opt.id}`}
										value={opt.id}
									>
										<span
											className="block w-3.5 rounded-[1px] bg-current"
											style={{ height: opt.barHeight }}
										/>
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</SettingRow>
					</div>

					<DialogFooter className="mt-2">
						<Button onClick={attemptClose} type="button" variant="ghost">
							キャンセル
						</Button>
						<Button disabled={!dirty} onClick={save} type="button">
							保存
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog onOpenChange={setConfirmDiscard} open={confirmDiscard}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>変更を破棄しますか?</AlertDialogTitle>
						<AlertDialogDescription>
							編集中の設定は保存されません。続けて編集する場合はキャンセルしてください。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>編集を続ける</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setConfirmDiscard(false);
								setOpen(false);
							}}
						>
							破棄する
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

function SettingRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<span className="font-mono text-[11px] text-muted-foreground">
				{label}
			</span>
			{children}
		</div>
	);
}
