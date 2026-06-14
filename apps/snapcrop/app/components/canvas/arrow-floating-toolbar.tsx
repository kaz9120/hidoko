import {
	BringToFrontIcon,
	CopyPlusIcon,
	SendToBackIcon,
	Trash2Icon,
} from "lucide-react";
import {
	Button,
	ToggleGroup,
	ToggleGroupItem,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "ui";
import { FloatingToolbar } from "~/components/canvas/floating-toolbar";
import { annotationBounds } from "~/lib/annotation-bounds";
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
	zoom: number;
	imageWidth: number;
	imageHeight: number;
	visible: boolean;
	canBringForward: boolean;
	canSendBackward: boolean;
	onThicknessChange: (thickness: ArrowThickness) => void;
	onDuplicate: () => void;
	onBringForward: () => void;
	onSendBackward: () => void;
	onDelete: () => void;
};

/**
 * 矢印選択中に bbox 上辺に貼り付くフローティングツールバー (確定仕様 Phase 3 / #147)。
 * 試験スコープでは「太さ + 複製 + z 順 + 削除」を持たせる。色や線形・キャップ等
 * 矢印固有の他のプロパティは次の PR で順次フローティングへ引き取る。
 *
 * 矢印選択時はこのバーが AnnotationMiniActions の役目も担うため、呼び側
 * (ImageStage) で MiniActions の描画を抑止する。
 */
export function ArrowFloatingToolbar({
	arrow,
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
			bbox={annotationBounds(arrow)}
			imageHeight={imageHeight}
			imageWidth={imageWidth}
			visible={visible}
			zoom={zoom}
		>
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

			<span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-border" />

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						aria-label="選択中の矢印を複製"
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
						aria-label="選択中の矢印を前面へ"
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
						aria-label="選択中の矢印を背面へ"
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
						aria-label="選択中の矢印を削除"
						onClick={onDelete}
						size="icon-sm"
						variant="ghost"
					>
						<Trash2Icon strokeWidth={1.75} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>削除 (⌫)</TooltipContent>
			</Tooltip>
		</FloatingToolbar>
	);
}
