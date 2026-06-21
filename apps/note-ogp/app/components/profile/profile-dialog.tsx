import { useEffect, useId, useState } from "react";
import { Button } from "ui";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "ui/components/dialog";
import { Field, FieldDescription, FieldLabel } from "ui/components/field";
import { Input } from "ui/components/input";
import { Switch } from "ui/components/switch";

export type ProfileValues = {
	brand: string;
	author: string;
	account: string;
	showMark: boolean;
};

/**
 * プロフィール（ブランド表記 / 名前 / アカウント / 炎マーク）の編集ダイアログ
 * (Issue #135)。初回起動時と、ヘッダー右のプロフィールチップをクリックした
 * ときの両方から開く。
 *
 * 「保存」を押すまで親の state は更新しない（ダイアログ内のローカル state で
 * 編集を保持）。「キャンセル」を押すと変更を捨ててダイアログを閉じる。
 *
 * マストヘッドプレビューは、編集中の値が実際の OGP のマストヘッドにどう載るかを
 * 縮小で見せる。`showMark` トグルの効きも視覚的に確認できる。
 */
export function ProfileDialog({
	open,
	initialValues,
	intro,
	onSave,
	onCancel,
}: {
	open: boolean;
	initialValues: ProfileValues;
	/** 初回起動時のヒント文を出すかどうか。チップ起動なら通常は false。 */
	intro?: boolean;
	onSave: (values: ProfileValues) => void;
	onCancel: () => void;
}) {
	// open が立ち上がった瞬間に initialValues で初期化し、以後はダイアログ内で
	// 編集する。open が切り替わるたびにリセットされる。
	const [values, setValues] = useState<ProfileValues>(initialValues);
	useEffect(() => {
		if (open) {
			setValues(initialValues);
		}
	}, [open, initialValues]);

	const brandId = useId();
	const authorId = useId();
	const accountId = useId();

	const handleOpenChange = (next: boolean) => {
		if (!next) onCancel();
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>プロフィールを設定する</DialogTitle>
					<DialogDescription>
						{intro
							? "ここで決めたものは、どのテンプレートにも載り続ける。毎回の画面には出てこない。"
							: "ヘッダーのチップからいつでも開き直せる。"}
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-3.5">
					<Field>
						<FieldLabel
							htmlFor={brandId}
							className="font-mono text-[10px] uppercase tracking-[0.22em]"
						>
							ブランド表記
						</FieldLabel>
						<Input
							id={brandId}
							value={values.brand}
							onChange={(e) =>
								setValues((v) => ({ ...v, brand: e.target.value }))
							}
							placeholder="焚き火を愛するエンジニア"
						/>
						<FieldDescription>マストヘッドに入る一言</FieldDescription>
					</Field>

					<div className="grid grid-cols-2 gap-2.5">
						<Field>
							<FieldLabel
								htmlFor={authorId}
								className="font-mono text-[10px] uppercase tracking-[0.22em]"
							>
								名前
							</FieldLabel>
							<Input
								id={authorId}
								value={values.author}
								onChange={(e) =>
									setValues((v) => ({ ...v, author: e.target.value }))
								}
								placeholder="山本一将"
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
								value={values.account}
								onChange={(e) =>
									setValues((v) => ({ ...v, account: e.target.value }))
								}
								placeholder="@kyamamoto9120"
								className="font-mono"
							/>
						</Field>
					</div>

					<Field orientation="horizontal">
						<FieldLabel
							htmlFor={`${brandId}-mark`}
							className="font-mono text-[10px] uppercase tracking-[0.22em]"
						>
							炎マーク
						</FieldLabel>
						<Switch
							id={`${brandId}-mark`}
							checked={values.showMark}
							onCheckedChange={(checked) =>
								setValues((v) => ({ ...v, showMark: checked }))
							}
						/>
					</Field>

					<MastheadPreview values={values} />
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onCancel}>
						キャンセル
					</Button>
					<Button type="button" onClick={() => onSave(values)}>
						保存する
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/**
 * マストヘッドプレビュー。テンプレートの実描画ではなく、要素の関係性を伝える
 * ための簡易ミニチュア (色は tokens を使い、テンプレートと完全一致は狙わない)。
 */
function MastheadPreview({ values }: { values: ProfileValues }) {
	return (
		<div className="rounded-md border border-border bg-bg p-3 font-mono text-[11px] text-text-muted">
			<div className="mb-1 text-[9px] uppercase tracking-[0.22em] text-(--text-faint)">
				マストヘッドのプレビュー
			</div>
			<div className="flex items-baseline gap-2 text-text">
				{values.showMark && (
					<span aria-hidden="true" className="text-primary">
						●
					</span>
				)}
				<span className="text-text/80">{values.brand || "—"}</span>
			</div>
			<div className="mt-0.5 text-[10px] text-(--text-faint)">
				{values.author || "—"}
				{values.account ? ` · ${values.account}` : ""}
			</div>
		</div>
	);
}
