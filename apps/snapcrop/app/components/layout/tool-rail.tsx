import {
	CropIcon,
	Grid3X3Icon,
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "ui/components/dropdown-menu";
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
	{ id: "mosaic", icon: Grid3X3Icon, label: "モザイク", shortcut: "M" },
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
			className={`flex w-12 shrink-0 flex-col items-center gap-1 border-border border-r bg-[var(--bg-overlay)] py-2 transition-opacity ${
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
								size="icon"
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

			<span aria-hidden="true" className="my-3 h-px w-6 shrink-0 bg-border" />

			{(() => {
				const current = STYLE_PRESETS[stylePreset];
				const CurrentIcon = STYLE_PRESET_ICONS[stylePreset];
				return (
					<DropdownMenu>
						<Tooltip>
							<TooltipTrigger asChild>
								<DropdownMenuTrigger asChild>
									<Toggle
										aria-label={`スタイル: ${current.label}`}
										size="icon"
										variant="default"
									>
										<CurrentIcon strokeWidth={1.75} />
									</Toggle>
								</DropdownMenuTrigger>
							</TooltipTrigger>
							<TooltipContent side="right">
								スタイル: {current.label}
							</TooltipContent>
						</Tooltip>
						<DropdownMenuContent side="right" align="start">
							<DropdownMenuRadioGroup
								value={stylePreset}
								onValueChange={(value) =>
									handleStylePresetChange(value as StylePresetId)
								}
							>
								{STYLE_PRESET_ORDER.map((id, i) => {
									const preset = STYLE_PRESETS[id];
									const Icon = STYLE_PRESET_ICONS[id];
									return (
										<DropdownMenuRadioItem key={id} value={id}>
											<Icon strokeWidth={1.75} />
											<span className="flex-1">{preset.label}</span>
											<span className="text-text-muted text-xs">
												{preset.hint}
											</span>
											<DropdownMenuShortcut>{i + 1}</DropdownMenuShortcut>
										</DropdownMenuRadioItem>
									);
								})}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			})()}

			<span aria-hidden="true" className="my-3 h-px w-6 shrink-0 bg-border" />

			<Popover>
				<Tooltip>
					<TooltipTrigger asChild>
						<PopoverTrigger asChild>
							<button
								type="button"
								aria-label="色を変える"
								className="size-10 shrink-0 rounded-full border-2 border-border ring-offset-2 ring-offset-[var(--bg-overlay)] transition-shadow hover:ring-2 hover:ring-accent/40"
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
			<span className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
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
								active ? "ring-2 ring-text-strong" : "border-border"
							}`}
							style={{ backgroundColor: c }}
						/>
					);
				})}
			</div>
		</div>
	);
}
