import {
	BringToFrontIcon,
	CopyPlusIcon,
	SendToBackIcon,
	Trash2Icon,
} from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";

type Props = {
	canBringForward: boolean;
	canSendBackward: boolean;
	onDuplicate: () => void;
	onBringForward: () => void;
	onSendBackward: () => void;
	onDelete: () => void;
};

/**
 * フローティングツールバー (#147 Phase 3) の右端に積む共通アクション群。
 * 種別ごとの編集 UI のあとに区切り線 + 複製 / 前面へ / 背面へ / 削除を並べる。
 * 確定仕様だと共通アクションは「削除のみ」が本来の規定で、複製・z 順は
 * キーボードショートカット側に寄せる予定。次の整理 PR で揃える。
 */
export function FloatingToolbarActions({
	canBringForward,
	canSendBackward,
	onDuplicate,
	onBringForward,
	onSendBackward,
	onDelete,
}: Props) {
	return (
		<>
			<span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-border" />
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						aria-label="選択中の図形を複製"
						onClick={onDuplicate}
						size="icon-sm"
						variant="ghost"
					>
						<CopyPlusIcon strokeWidth={1.75} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>複製 (⌘D)</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						aria-label="選択中の図形を前面へ"
						disabled={!canBringForward}
						onClick={onBringForward}
						size="icon-sm"
						variant="ghost"
					>
						<BringToFrontIcon strokeWidth={1.75} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>前面へ (])</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						aria-label="選択中の図形を背面へ"
						disabled={!canSendBackward}
						onClick={onSendBackward}
						size="icon-sm"
						variant="ghost"
					>
						<SendToBackIcon strokeWidth={1.75} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>背面へ ([)</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						aria-label="選択中の図形を削除"
						onClick={onDelete}
						size="icon-sm"
						variant="ghost"
					>
						<Trash2Icon strokeWidth={1.75} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>削除 (⌫)</TooltipContent>
			</Tooltip>
		</>
	);
}
