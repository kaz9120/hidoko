import { CropIcon, Maximize2Icon } from "lucide-react";
import { Button } from "ui";
import { Kbd } from "ui/components/kbd";
import { FloatingToolbar } from "~/components/canvas/floating-toolbar";
import type { CropRect } from "~/lib/crop-engine";

type Props = {
	/** 確定済みのクロップ範囲。寸法の表示に使う。 */
	crop: CropRect;
	/** 枠の編集を再開する。 */
	onEdit: () => void;
	/** クロップを解除して画像全体に戻す。 */
	onReset: () => void;
};

/**
 * クロップ確定後のバー。キャンバスは切り取り後に切り替わっていて枠が出ない
 * ので、ここが「まだやり直せる」ことを示す唯一の手掛かりになる。
 *
 * 元画像は捨てていないので、範囲を調整すれば枠を広げ直せる。全体に戻す操作も
 * 並べて、切り取りが行き止まりでないことを見えるようにする。
 */
export function CropCommittedToolbar({ crop, onEdit, onReset }: Props) {
	return (
		<FloatingToolbar>
			<span className="px-1 font-mono text-muted-foreground text-xs">
				{Math.round(crop.width)} × {Math.round(crop.height)}
			</span>
			<span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-border" />
			<Button
				aria-label="切り取り範囲を調整する"
				onClick={onEdit}
				size="sm"
				title="切り取り範囲を調整する"
				variant="outline"
			>
				<CropIcon strokeWidth={1.75} />
				範囲を調整
				<Kbd>V</Kbd>
			</Button>
			<Button
				aria-label="クロップを解除して画像全体に戻す"
				onClick={onReset}
				size="sm"
				title="クロップを解除して画像全体に戻す"
				variant="ghost"
			>
				<Maximize2Icon strokeWidth={1.75} />
				全体に戻す
			</Button>
		</FloatingToolbar>
	);
}
