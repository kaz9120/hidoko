import {
	type LucideIcon,
	MaximizeIcon,
	ZoomInIcon,
	ZoomOutIcon,
} from "lucide-react";
import {
	Button,
	Menu,
	MenuContent,
	MenuItem,
	MenuTrigger,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "takibi-design-system";
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
			<Menu>
				<Tooltip>
					<TooltipTrigger
						render={
							<MenuTrigger
								disabled={disabled}
								render={
									<Button
										aria-label="ズーム倍率"
										className="w-14 px-1 font-mono text-xs tabular-nums"
										size="sm"
										variant="ghost"
									/>
								}
							/>
						}
					>
						{Math.round(zoom * 100)}%
					</TooltipTrigger>
					<TooltipContent>ズーム倍率</TooltipContent>
				</Tooltip>
				<MenuContent align="center">
					{ZOOM_PRESETS.map((preset) => (
						<MenuItem
							key={preset.label}
							onClick={() => onZoomPreset(preset.zoom)}
						>
							{preset.label}
						</MenuItem>
					))}
					<MenuItem onClick={onFit}>画面に合わせる</MenuItem>
				</MenuContent>
			</Menu>
			<ZoomIconButton
				disabled={disabled}
				icon={ZoomInIcon}
				label="拡大 (⌘+)"
				onClick={onZoomIn}
			/>
			<span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-line" />
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
			<TooltipTrigger
				render={
					<Button
						aria-label={label}
						disabled={disabled}
						onClick={onClick}
						size="icon"
						variant="ghost"
					/>
				}
			>
				<Icon strokeWidth={1.75} />
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}
