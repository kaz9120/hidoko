import { ToggleGroup, ToggleGroupItem } from "ui";
import { FloatingToolbar } from "~/components/canvas/floating-toolbar";
import { FloatingToolbarActions } from "~/components/canvas/floating-toolbar-actions";
import { annotationBounds } from "~/lib/annotation-bounds";
import type { RectAnnotation, RectThickness } from "~/lib/rect-engine";

const THICKNESS_OPTIONS: ReadonlyArray<{
	id: RectThickness;
	barHeight: number;
}> = [
	{ id: "sm", barHeight: 1 },
	{ id: "md", barHeight: 2.5 },
	{ id: "lg", barHeight: 5 },
];

type Props = {
	rect: RectAnnotation;
	zoom: number;
	imageWidth: number;
	imageHeight: number;
	visible: boolean;
	canBringForward: boolean;
	canSendBackward: boolean;
	onThicknessChange: (thickness: RectThickness) => void;
	onDuplicate: () => void;
	onBringForward: () => void;
	onSendBackward: () => void;
	onDelete: () => void;
};

/**
 * 矩形選択中のフローティングツールバー (#147 Phase 3)。
 *
 * モザイクは独立ツール化 (#146 / PR #173) されたので、ここでは outline 限定の
 * 「枠線の太さ + 共通アクション」を持つ。色は色レール集約 (#145) 済みなので
 * フローティングには含めない。質感 (clean / sketchy) はスタイルプリセット
 * (#145) で決まるためフローティングからは省く。
 */
export function RectFloatingToolbar({
	rect,
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
			bbox={annotationBounds(rect)}
			imageHeight={imageHeight}
			imageWidth={imageWidth}
			visible={visible}
			zoom={zoom}
		>
			<ToggleGroup
				aria-label="枠線の太さ"
				onValueChange={(next) => {
					if (next) onThicknessChange(next as RectThickness);
				}}
				type="single"
				value={rect.thickness}
				variant="outline"
			>
				{THICKNESS_OPTIONS.map((opt) => (
					<ToggleGroupItem
						aria-label={`太さ: ${opt.id}`}
						key={opt.id}
						size="sm"
						title={`太さ: ${opt.id}`}
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
