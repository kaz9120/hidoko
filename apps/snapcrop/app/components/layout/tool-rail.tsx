import { CropIcon, MoveUpRightIcon, SquareIcon, TypeIcon } from "lucide-react";
import { Toggle, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import { type ActiveTool, useSnapcrop } from "~/contexts/snapcrop-context";

type ToolDef = {
	id: ActiveTool;
	icon: typeof CropIcon;
	label: string;
	shortcut: string;
};

const TOOLS: ToolDef[] = [
	{ id: "crop", icon: CropIcon, label: "クロップ", shortcut: "V" },
	{ id: "rect", icon: SquareIcon, label: "矩形", shortcut: "R" },
	{ id: "arrow", icon: MoveUpRightIcon, label: "矢印", shortcut: "A" },
	{ id: "text", icon: TypeIcon, label: "テキスト", shortcut: "T" },
];

/**
 * キャンバス左端の編集ツール選択レール。画像があるときだけ表示する。
 * 将来 arrow / text 等のツールを追加するときは TOOLS を伸ばすだけ。
 */
export function ToolRail() {
	const { image, activeTool, setActiveTool } = useSnapcrop();

	if (!image) {
		return null;
	}

	return (
		<aside
			aria-label="編集ツール"
			className="flex w-11 shrink-0 flex-col items-center gap-1 border-border border-r bg-[var(--bg-overlay)] py-2"
		>
			{TOOLS.map((tool) => {
				const Icon = tool.icon;
				const pressed = activeTool === tool.id;
				return (
					<Tooltip key={tool.id}>
						<TooltipTrigger asChild>
							<Toggle
								aria-label={`${tool.label} (${tool.shortcut})`}
								onPressedChange={(next) => {
									// 同じツールを再クリックして外す挙動は無効。常に「選択」方向にだけ反応する
									if (next) setActiveTool(tool.id);
								}}
								pressed={pressed}
								size="sm"
								variant="default"
							>
								<Icon strokeWidth={1.75} />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent side="right">
							{tool.label} ({tool.shortcut})
						</TooltipContent>
					</Tooltip>
				);
			})}
		</aside>
	);
}
