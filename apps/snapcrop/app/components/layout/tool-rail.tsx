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
import { Popover, PopoverContent, PopoverTrigger } from "ui/components/popover";
import {
	type ActiveTool,
	type StylePresetId,
	useSnapcrop,
} from "~/contexts/snapcrop-context";
import { HIGHLIGHT_PRESET_COLORS } from "~/lib/highlight-engine";
import { PRESET_COLORS } from "~/lib/rect-engine";
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
	const {
		image,
		activeTool,
		setActiveTool,
		stylePreset,
		setStylePreset,
		rectDefaults,
		highlightDefaults,
		setSharedFigureColor,
		setMarkerColor,
	} = useSnapcrop();

	if (!image) {
		return null;
	}

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

			<span aria-hidden="true" className="my-1.5 h-px w-6 shrink-0 bg-border" />

			<Popover>
				<Tooltip>
					<TooltipTrigger asChild>
						<PopoverTrigger asChild>
							<button
								type="button"
								aria-label="色を変える"
								className="size-7 shrink-0 rounded-full border-2 border-border ring-offset-2 ring-offset-[var(--bg-overlay)] transition-shadow hover:ring-2 hover:ring-primary/40"
								style={{ backgroundColor: rectDefaults.color }}
							/>
						</PopoverTrigger>
					</TooltipTrigger>
					<TooltipContent side="right">注釈の色</TooltipContent>
				</Tooltip>
				<PopoverContent side="right" align="end" className="w-56 p-3">
					<div className="flex flex-col gap-3">
						<ColorRow
							title="図形・文字"
							value={rectDefaults.color}
							colors={PRESET_COLORS}
							onChange={setSharedFigureColor}
						/>
						<ColorRow
							title="マーカー"
							value={highlightDefaults.color}
							colors={HIGHLIGHT_PRESET_COLORS}
							onChange={setMarkerColor}
						/>
						<p className="text-[10.5px] text-(--text-faint)">
							保存されます。次に開いたときもこの色から始まります。
						</p>
					</div>
				</PopoverContent>
			</Popover>
		</aside>
	);
}

function ColorRow({
	title,
	value,
	colors,
	onChange,
}: {
	title: string;
	value: string;
	colors: readonly string[];
	onChange: (color: string) => void;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
				{title}
			</span>
			<div className="flex flex-wrap items-center gap-1.5">
				{colors.map((c) => {
					const active = c.toLowerCase() === value.toLowerCase();
					return (
						<button
							key={c}
							type="button"
							aria-label={`色 ${c}`}
							onClick={() => onChange(c)}
							className={`size-5 shrink-0 rounded-full border ring-offset-1 ring-offset-(--popover) transition-all hover:scale-110 ${
								active ? "ring-2 ring-foreground" : "border-border"
							}`}
							style={{ backgroundColor: c }}
						/>
					);
				})}
			</div>
		</div>
	);
}
