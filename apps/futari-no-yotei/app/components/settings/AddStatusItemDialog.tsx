import { type FormEvent, useId, useState } from "react";
import { Button } from "ui/components/button";
import {
	Dialog,
	DialogClose,
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

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: {
		name: string;
		emoji: string;
		assignee: Assignee;
	}) => void;
	submitting?: boolean;
};

const ASSIGNEE_BUTTONS: Array<{ value: Assignee; label: string }> = [
	{ value: "me", label: `${ME.name}が決める` },
	{ value: "partner", label: `${PARTNER.name}が決める` },
	{ value: "both", label: "ふたりで" },
];

/**
 * ステータス項目を追加する dialog。本 PR では「項目を持つこと自体」を証明する
 * 最小構成 (name / emoji / assignee の 3 項目) で受け、選択肢は API 側のデフォ
 * (はい / いいえ) を流し込む。曜日デフォルトと選択肢のカスタマイズは後続 PR で
 * 編集 UI 側に乗せる。
 */
export function AddStatusItemDialog({
	open,
	onOpenChange,
	onSubmit,
	submitting = false,
}: Props) {
	const nameId = useId();
	const emojiId = useId();
	const [name, setName] = useState("");
	const [emoji, setEmoji] = useState("");
	const [assignee, setAssignee] = useState<Assignee>("both");

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		// 連打 / Enter 連打で同一項目を重複作成しないよう、送信中は弾く
		if (submitting) return;
		if (!name.trim() || !emoji.trim()) return;
		onSubmit({ name: name.trim(), emoji: emoji.trim(), assignee });
	}

	function reset() {
		setName("");
		setEmoji("");
		setAssignee("both");
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(v: boolean) => {
				if (!v) reset();
				onOpenChange(v);
			}}
		>
			<DialogContent className="max-w-[360px]">
				<DialogHeader>
					<DialogTitle>項目を追加</DialogTitle>
					<DialogDescription>
						選択肢は「はい / いいえ」が初期値です。あとから編集できます。
					</DialogDescription>
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
						<Input
							id={emojiId}
							value={emoji}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setEmoji(e.target.value)
							}
							placeholder="例: 🗑"
							required
							maxLength={4}
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
					<DialogFooter className="mt-2">
						<DialogClose asChild>
							<Button type="button" variant="ghost">
								キャンセル
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={submitting || !name.trim() || !emoji.trim()}
						>
							{submitting ? "追加中…" : "追加"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
