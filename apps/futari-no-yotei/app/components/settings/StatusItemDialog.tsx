import { type FormEvent, useEffect, useId, useMemo, useState } from "react";
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
import { Button } from "ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "ui/components/dialog";
import { Input } from "ui/components/input";
import { Label } from "ui/components/label";
import { ME, PARTNER } from "~/lib/data/sample";
import type { Assignee } from "~/lib/types";
import { EmojiPicker } from "./EmojiPicker";

export type StatusItemFormValues = {
	name: string;
	emoji: string;
	assignee: Assignee;
};

type CreateMode = {
	mode: "create";
};

type EditMode = {
	mode: "edit";
	initial: StatusItemFormValues & { id: string };
	onDelete: () => void;
	deleting?: boolean;
};

type Props = (CreateMode | EditMode) & {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: StatusItemFormValues) => void;
	submitting?: boolean;
};

const ASSIGNEE_BUTTONS: Array<{ value: Assignee; label: string }> = [
	{ value: "me", label: `${ME.name}が決める` },
	{ value: "partner", label: `${PARTNER.name}が決める` },
	{ value: "both", label: "ふたりで" },
];

const DEFAULT_VALUES: StatusItemFormValues = {
	name: "",
	emoji: "",
	assignee: "both",
};

/**
 * ステータス項目の追加 / 編集 dialog。`mode="create"` のときは空フォーム、
 * `mode="edit"` のときは `initial` を初期値として埋め、フッターに削除ボタン
 * (AlertDialog 経由で確認 → 削除実行) も出す。
 *
 * UX 上の守り:
 *   - 外タップ / ESC は `preventDefault()` で抑止し、明示的な「キャンセル」
 *     ボタンか「保存 / 追加」完了時だけ閉じる。これにより削除確認 AlertDialog
 *     のキャンセルで外側 Dialog が連鎖クローズするバグも同時に防ぐ。
 *   - フォームが dirty な状態で閉じようとしたら「変更を破棄しますか?」を
 *     AlertDialog で確認。dirty でなければ即座に閉じる。
 *
 * 本 PR では選択肢 (`options`) と曜日デフォルト (`weekdayDefaults`) の編集 UI
 * は持たない。`name` / `emoji` / `assignee` だけを部分更新する。
 */
export function StatusItemDialog(props: Props) {
	const { open, onOpenChange, onSubmit, submitting = false } = props;
	const isEdit = props.mode === "edit";
	const initial = isEdit ? props.initial : DEFAULT_VALUES;
	const nameId = useId();
	const emojiId = useId();
	const [name, setName] = useState(initial.name);
	const [emoji, setEmoji] = useState(initial.emoji);
	const [assignee, setAssignee] = useState<Assignee>(initial.assignee);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [confirmDiscard, setConfirmDiscard] = useState(false);

	// 開閉や編集対象切替の度にフォームを初期化する。create → edit、
	// edit 中に別項目に切替、edit → create の各遷移を吸収する。
	useEffect(() => {
		if (open) {
			setName(initial.name);
			setEmoji(initial.emoji);
			setAssignee(initial.assignee);
			setConfirmDelete(false);
			setConfirmDiscard(false);
		}
	}, [open, initial.name, initial.emoji, initial.assignee]);

	const dirty = useMemo(
		() =>
			name !== initial.name ||
			emoji !== initial.emoji ||
			assignee !== initial.assignee,
		[name, emoji, assignee, initial.name, initial.emoji, initial.assignee],
	);

	function attemptClose() {
		if (dirty) {
			setConfirmDiscard(true);
		} else {
			onOpenChange(false);
		}
	}

	function discardAndClose() {
		setConfirmDiscard(false);
		onOpenChange(false);
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		// 連打 / Enter 連打で同一項目を重複作成しないよう、送信中は弾く
		if (submitting) return;
		if (!name.trim() || !emoji.trim()) return;
		onSubmit({ name: name.trim(), emoji: emoji.trim(), assignee });
	}

	const title = isEdit ? "項目を編集" : "項目を追加";
	const description = isEdit
		? "選択肢と曜日デフォルトの編集は後続 PR で対応します。"
		: "選択肢は「はい / いいえ」が初期値です。あとから編集できます。";
	const submitLabel = isEdit ? "保存" : "追加";
	const submittingLabel = isEdit ? "保存中…" : "追加中…";
	const deleting = isEdit ? props.deleting === true : false;

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(v) => {
					// 開く方向は素通し。閉じる方向は dirty チェック経由。
					if (v) onOpenChange(true);
					else attemptClose();
				}}
			>
				<DialogContent
					className="max-w-[360px]"
					// 外タップを抑止し、明示的なボタン操作 (キャンセル / 保存) からだけ
					// 閉じるようにする。これにより:
					//   - 編集中の内容が誤って消えない
					//   - 内側で開いた AlertDialog 操作で外側 Dialog が連鎖クローズしない
					onPointerDownOutside={(e) => {
						e.preventDefault();
						attemptClose();
					}}
					onEscapeKeyDown={(e) => {
						e.preventDefault();
						attemptClose();
					}}
				>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>{description}</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-3">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={nameId}>項目名</Label>
							<Input
								id={nameId}
								value={name}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setName(e.target.value)
								}
								placeholder="例: ゴミ出し / 送り迎え"
								required
								maxLength={20}
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={emojiId}>絵文字</Label>
							<EmojiPicker
								id={emojiId}
								value={emoji}
								onChange={setEmoji}
								ariaLabel="絵文字を選ぶ"
							/>
						</div>
						<fieldset className="flex flex-col gap-1.5 border-0 p-0">
							<legend className="mb-1.5 font-medium text-sm">誰が決める</legend>
							<div className="flex gap-1.5">
								{ASSIGNEE_BUTTONS.map((opt) => {
									const selected = assignee === opt.value;
									return (
										<label
											key={opt.value}
											className="flex flex-1 cursor-pointer items-center justify-center rounded-md border bg-bg-overlay px-2 py-1.5 text-xs transition-colors focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-2"
											style={{
												borderColor: selected
													? "color-mix(in oklab, var(--accent) 40%, transparent)"
													: "var(--border-subtle)",
												color: selected ? "var(--accent)" : "var(--text-muted)",
												fontWeight: selected ? 600 : 400,
												boxShadow: selected ? "var(--glow-ember-soft)" : "none",
											}}
										>
											<input
												type="radio"
												name="assignee"
												value={opt.value}
												checked={selected}
												onChange={() => setAssignee(opt.value)}
												className="sr-only"
											/>
											{opt.label}
										</label>
									);
								})}
							</div>
						</fieldset>
						<DialogFooter className="mt-2 gap-1 sm:gap-1">
							{isEdit ? (
								<Button
									type="button"
									variant="ghost"
									className="mr-auto text-rust hover:text-rust"
									onClick={() => setConfirmDelete(true)}
									disabled={submitting || deleting}
								>
									{deleting ? "削除中…" : "削除"}
								</Button>
							) : null}
							<Button type="button" variant="ghost" onClick={attemptClose}>
								キャンセル
							</Button>
							<Button
								type="submit"
								disabled={submitting || !name.trim() || !emoji.trim()}
							>
								{submitting ? submittingLabel : submitLabel}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{isEdit ? (
				<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								「{initial.name}」を削除します
							</AlertDialogTitle>
							<AlertDialogDescription>
								この項目に紐づく確定値もまとめて削除されます。元には戻せません。
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>キャンセル</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									setConfirmDelete(false);
									props.onDelete();
								}}
								className="bg-rust text-text-on-ember hover:bg-rust"
							>
								削除する
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			) : null}

			<AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>変更を破棄しますか?</AlertDialogTitle>
						<AlertDialogDescription>
							編集中の内容は保存されません。続けて編集する場合はキャンセルしてください。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>編集を続ける</AlertDialogCancel>
						<AlertDialogAction
							onClick={discardAndClose}
							className="bg-rust text-text-on-ember hover:bg-rust"
						>
							破棄する
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
