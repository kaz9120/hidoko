import {
	AlignCenterIcon,
	AlignLeftIcon,
	AlignRightIcon,
	BoldIcon,
	ItalicIcon,
} from "lucide-react";
import { Toggle, ToggleGroup, ToggleGroupItem } from "ui";
import { FloatingToolbar } from "~/components/canvas/floating-toolbar";
import { FloatingToolbarActions } from "~/components/canvas/floating-toolbar-actions";
import { annotationBounds } from "~/lib/annotation-bounds";
import type { TextAlign, TextAnnotation } from "~/lib/text-engine";

const ALIGN_OPTIONS: ReadonlyArray<{
	id: TextAlign;
	label: string;
	icon: typeof AlignLeftIcon;
}> = [
	{ id: "left", label: "左寄せ", icon: AlignLeftIcon },
	{ id: "center", label: "中央", icon: AlignCenterIcon },
	{ id: "right", label: "右寄せ", icon: AlignRightIcon },
];

type Props = {
	text: TextAnnotation;
	zoom: number;
	imageWidth: number;
	imageHeight: number;
	visible: boolean;
	canBringForward: boolean;
	canSendBackward: boolean;
	onAlignChange: (align: TextAlign) => void;
	onBoldToggle: (bold: boolean) => void;
	onItalicToggle: (italic: boolean) => void;
	onDuplicate: () => void;
	onBringForward: () => void;
	onSendBackward: () => void;
	onDelete: () => void;
};

/**
 * テキスト選択中のフローティングツールバー (#147 Phase 3)。
 * 「寄せ + 太字 / 斜体 + 共通アクション」を持つ。色は色レール集約 (#145) 済み、
 * フォント・サイズ・背景は変更頻度が低いので画面上端の TextToolbar に残す
 * (後続 PR で必要に応じて取り込む)。
 */
export function TextFloatingToolbar({
	text,
	zoom,
	imageWidth,
	imageHeight,
	visible,
	canBringForward,
	canSendBackward,
	onAlignChange,
	onBoldToggle,
	onItalicToggle,
	onDuplicate,
	onBringForward,
	onSendBackward,
	onDelete,
}: Props) {
	return (
		<FloatingToolbar
			bbox={annotationBounds(text)}
			imageHeight={imageHeight}
			imageWidth={imageWidth}
			visible={visible}
			zoom={zoom}
		>
			<ToggleGroup
				aria-label="寄せ"
				onValueChange={(next) => {
					if (next) onAlignChange(next as TextAlign);
				}}
				type="single"
				value={text.align}
				variant="outline"
			>
				{ALIGN_OPTIONS.map((opt) => {
					const Icon = opt.icon;
					return (
						<ToggleGroupItem
							aria-label={opt.label}
							key={opt.id}
							size="sm"
							title={opt.label}
							value={opt.id}
						>
							<Icon strokeWidth={1.75} />
						</ToggleGroupItem>
					);
				})}
			</ToggleGroup>

			<Toggle
				aria-label="太字"
				onPressedChange={onBoldToggle}
				pressed={text.bold}
				size="sm"
				variant="outline"
			>
				<BoldIcon strokeWidth={1.75} />
			</Toggle>
			<Toggle
				aria-label="斜体"
				onPressedChange={onItalicToggle}
				pressed={text.italic}
				size="sm"
				variant="outline"
			>
				<ItalicIcon strokeWidth={1.75} />
			</Toggle>

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
