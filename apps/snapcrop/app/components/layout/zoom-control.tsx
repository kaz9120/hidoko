import {
	type LucideIcon,
	MaximizeIcon,
	ZoomInIcon,
	ZoomOutIcon,
} from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "ui/components/dropdown-menu";
import { ZOOM_STEP } from "~/components/canvas/viewport";
import { useSnapcrop } from "~/contexts/snapcrop-context";

const ZOOM_PRESETS = [
	{ label: "50%", zoom: 0.5 },
	{ label: "100%", zoom: 1 },
	{ label: "200%", zoom: 2 },
] as const;

/**
 * ヘッダー1段目に常駐するズームコントロール。⊖ / % 表示 (クリックで
 * プリセットメニュー) / ⊕ と、区切り線を挟んだ「画面に合わせる」を並べる。
 * 状態は SnapcropContext の zoom (Viewport が onZoomChange で書き込む) を
 * 購読するので、⌘+wheel ズームやショートカットとも常に同期する。
 */
export function ZoomControl() {
	const { image, zoom, viewportRef } = useSnapcrop();

	return (
		<ZoomControlView
			disabled={!image}
			onFit={() => viewportRef.current?.fitToContainer()}
			onZoomIn={() => {
				const vp = viewportRef.current;
				vp?.setZoom(vp.getZoom() * ZOOM_STEP);
			}}
			onZoomOut={() => {
				const vp = viewportRef.current;
				vp?.setZoom(vp.getZoom() / ZOOM_STEP);
			}}
			onZoomPreset={(next) => viewportRef.current?.setZoom(next)}
			zoom={zoom}
		/>
	);
}

export type ZoomControlViewProps = {
	/** ズーム倍率 (1 = 100%)。 */
	zoom: number;
	/** 画像未ロードなど、操作対象がないときに全体を無効化する。 */
	disabled?: boolean;
	onZoomOut: () => void;
	onZoomIn: () => void;
	onZoomPreset: (zoom: number) => void;
	onFit: () => void;
};

/**
 * ZoomControl の表示部。Storybook から状態を注入できるよう、context に
 * 依存しない props 駆動のコンポーネントとして切り出している。
 */
export function ZoomControlView({
	zoom,
	disabled,
	onZoomOut,
	onZoomIn,
	onZoomPreset,
	onFit,
}: ZoomControlViewProps) {
	return (
		<div className="flex items-center gap-1">
			<ZoomIconButton
				disabled={disabled}
				icon={ZoomOutIcon}
				label="縮小 (⌘−)"
				onClick={onZoomOut}
			/>
			<DropdownMenu>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label="ズーム倍率"
								className="w-14 px-1 font-mono text-xs tabular-nums"
								disabled={disabled}
								size="sm"
								variant="ghost"
							>
								{Math.round(zoom * 100)}%
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent>ズーム倍率</TooltipContent>
				</Tooltip>
				<DropdownMenuContent align="center">
					{ZOOM_PRESETS.map((preset) => (
						<DropdownMenuItem
							key={preset.label}
							onSelect={() => onZoomPreset(preset.zoom)}
						>
							{preset.label}
						</DropdownMenuItem>
					))}
					<DropdownMenuItem onSelect={onFit}>画面に合わせる</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ZoomIconButton
				disabled={disabled}
				icon={ZoomInIcon}
				label="拡大 (⌘+)"
				onClick={onZoomIn}
			/>
			<span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border" />
			<ZoomIconButton
				disabled={disabled}
				icon={MaximizeIcon}
				label="画面に合わせる (⌘0)"
				onClick={onFit}
			/>
		</div>
	);
}

function ZoomIconButton({
	icon: Icon,
	label,
	onClick,
	disabled,
}: {
	icon: LucideIcon;
	label: string;
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					aria-label={label}
					disabled={disabled}
					onClick={onClick}
					size="icon-sm"
					variant="ghost"
				>
					<Icon strokeWidth={1.75} />
				</Button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}
