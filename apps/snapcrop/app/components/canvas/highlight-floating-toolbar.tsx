import { ToggleGroup, ToggleGroupItem } from "ui";
import { FloatingToolbar } from "~/components/canvas/floating-toolbar";
import { FloatingToolbarActions } from "~/components/canvas/floating-toolbar-actions";
import { annotationBounds } from "~/lib/annotation-bounds";
import type {
	HighlightAnnotation,
	HighlightThickness,
} from "~/lib/highlight-engine";

const THICKNESS_OPTIONS: ReadonlyArray<{
	id: HighlightThickness;
	label: string;
	barHeight: number;
}> = [
	{ id: "sm", label: "細", barHeight: 3 },
	{ id: "md", label: "中", barHeight: 5 },
	{ id: "lg", label: "太", barHeight: 8 },
];

type Props = {
	highlight: HighlightAnnotation;
	zoom: number;
	imageWidth: number;
	imageHeight: number;
	visible: boolean;
	canBringForward: boolean;
	canSendBackward: boolean;
	onThicknessChange: (thickness: HighlightThickness) => void;
	onDuplicate: () => void;
	onBringForward: () => void;
	onSendBackward: () => void;
	onDelete: () => void;
};

/**
 * マーカー選択中のフローティングツールバー (#147 Phase 3)。
 * 「帯の太さ + 共通アクション」を持つ。色は色レール集約 (#145) 済み、
 * 質感 (clean / sketchy) はスタイルプリセット (#145) で決まるためフローティング
 * からは省く。
 */
export function HighlightFloatingToolbar({
	highlight,
	zoom,
	imageWidth,
	imageHeight,
	visible,
	canBringForward,
	canSendBackward,
	onThicknessChange,
	onDuplicate,
	onBringForward,
	onSendBackward,
	onDelete,
}: Props) {
	return (
		<FloatingToolbar
			bbox={annotationBounds(highlight)}
			imageHeight={imageHeight}
			imageWidth={imageWidth}
			visible={visible}
			zoom={zoom}
		>
			<ToggleGroup
				aria-label="帯の太さ"
				onValueChange={(next) => {
					if (next) onThicknessChange(next as HighlightThickness);
				}}
				type="single"
				value={highlight.thickness}
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
