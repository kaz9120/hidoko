import {
	CropIcon,
	HighlighterIcon,
	MoveUpRightIcon,
	PencilIcon,
	RulerIcon,
	SquareIcon,
	StarIcon,
	TypeIcon,
	WavesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Toggle, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import {
	type ActiveTool,
	type StylePresetId,
	useSnapcrop,
} from "~/contexts/snapcrop-context";
import { STYLE_PRESET_ORDER, STYLE_PRESETS } from "~/lib/style-presets";

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
	{ id: "highlight", icon: HighlighterIcon, label: "マーカー", shortcut: "H" },
];

/**
 * スタイルプリセットを視覚で区別するためのアイコン (Issue #145)。lucide に
 * 「同じモチーフのテイスト違い 4 種」のような専用セットは無いため、各
 * プリセットの世界観に近いアイコンを 1 つずつ選んだ。
 */
const STYLE_PRESET_ICONS: Record<StylePresetId, typeof CropIcon> = {
	clean: RulerIcon,
	sketch: PencilIcon,
	emphasis: StarIcon,
	soft: WavesIcon,
};

/**
 * キャンバス左端の編集ツール選択レール。画像があるときだけ表示する。
 * 上から「ツール」→ 区切り →「スタイル」(Issue #145) の順で並べる
 * (確定仕様: snapcrop 新デザイン 最終版 / RailAnatomy)。「色」のレール末尾
 * 集約は Phase 1b の別 PR で乗せる。
 */
export function ToolRail() {
	const { image, activeTool, setActiveTool, stylePreset, setStylePreset } =
		useSnapcrop();

	// 画像が未ロードのときは「ツール無効」を視覚で伝えるために透過 + 操作不可で
	// 残す (確定仕様: snapcrop 新デザイン 最終版 / FinalEmpty)。Issue #148。
	// 完全に return null すると EmptyHero と左端の空白が同居して落ち着かない。
	const disabled = !image;

	const handleStylePresetChange = (id: StylePresetId) => {
		setStylePreset(id);
		const preset = STYLE_PRESETS[id];
		toast.success(`スタイル: ${preset.label}`, {
			description: `${preset.hint} — 以降の図形に適用`,
			duration: 2200,
		});
	};

	return (
		<aside
			aria-label="編集ツール"
			aria-disabled={disabled}
			className={`flex w-11 shrink-0 flex-col items-center gap-1 border-border border-r bg-[var(--bg-overlay)] py-2 transition-opacity ${
				disabled ? "pointer-events-none opacity-40" : ""
			}`}
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

			<span aria-hidden="true" className="my-1.5 h-px w-6 shrink-0 bg-border" />

			{STYLE_PRESET_ORDER.map((id) => {
				const preset = STYLE_PRESETS[id];
				const Icon = STYLE_PRESET_ICONS[id];
				const pressed = stylePreset === id;
				return (
					<Tooltip key={id}>
						<TooltipTrigger asChild>
							<Toggle
								aria-label={`スタイル: ${preset.label}`}
								onPressedChange={(next) => {
									if (next) handleStylePresetChange(id);
								}}
								pressed={pressed}
								size="sm"
								variant="default"
							>
								<Icon strokeWidth={1.75} />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent side="right">
							{preset.label} — {preset.hint}
						</TooltipContent>
					</Tooltip>
				);
			})}
		</aside>
	);
}
