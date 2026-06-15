import { ToggleGroup, ToggleGroupItem } from "ui";
import { FloatingToolbar } from "~/components/canvas/floating-toolbar";
import { FloatingToolbarActions } from "~/components/canvas/floating-toolbar-actions";
import type { ArrowAnnotation, ArrowThickness } from "~/lib/arrow-engine";

const THICKNESS_OPTIONS: ReadonlyArray<{
	id: ArrowThickness;
	label: string;
	barHeight: number;
}> = [
	{ id: "sm", label: "細", barHeight: 1.5 },
	{ id: "md", label: "中", barHeight: 3 },
	{ id: "lg", label: "太", barHeight: 6 },
];

type Props = {
	arrow: ArrowAnnotation;
	canBringForward: boolean;
	canSendBackward: boolean;
	onThicknessChange: (thickness: ArrowThickness) => void;
	onDuplicate: () => void;
	onBringForward: () => void;
	onSendBackward: () => void;
	onDelete: () => void;
};

/**
 * 矢印選択中のフローティングツールバー (#147 Phase 3 / 上部固定版)。
 * 「太さ + 共通アクション (複製・z 順・削除)」を持つ。確定仕様だと矢印は
 * 「始点 / 終点キャップ + 削除」が本来の中身で、太さはスタイルプリセットで
 * 決まるため出ない予定。次の整理 PR で揃える。
 */
export function ArrowFloatingToolbar({
	arrow,
	canBringForward,
	canSendBackward,
	onThicknessChange,
	onDuplicate,
	onBringForward,
	onSendBackward,
	onDelete,
}: Props) {
	return (
		<FloatingToolbar>
			<ToggleGroup
				aria-label="太さ"
				onValueChange={(next) => {
					if (next) onThicknessChange(next as ArrowThickness);
				}}
				type="single"
				value={arrow.thickness}
				variant="outline"
			>
				{THICKNESS_OPTIONS.map((opt) => (
					<ToggleGroupItem
						aria-label={`太さ: ${opt.label}`}
						key={opt.id}
						size="sm"
						title={`太さ: ${opt.label}`}
						value={opt.id}
					>
						<span
							className="block w-3.5 rounded-[1px] bg-current"
							style={{ height: opt.barHeight }}
						/>
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<FloatingToolbarActions
				canBringForward={canBringForward}
				canSendBackward={canSendBackward}
				onBringForward={onBringForward}
				onDelete={onDelete}
				onDuplicate={onDuplicate}
				onSendBackward={onSendBackward}
			/>
		</FloatingToolbar>
	);
}
