import {
	BringToFrontIcon,
	CopyPlusIcon,
	SendToBackIcon,
	Trash2Icon,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import type { Rect } from "~/lib/annotation-bounds";

/** 注釈とバーの間隔 (CSS px)。zoom に依存しない見た目上の距離。 */
const GAP_PX = 8;

type Props = {
	/** 選択中の注釈の外接矩形 (画像 px)。annotationBounds() で算出する */
	bounds: Rect;
	zoom: number;
	imageWidth: number;
	imageHeight: number;
	onDuplicate: () => void;
	/** 1 段前面へ (#105)。 */
	onBringForward: () => void;
	/** 1 段背面へ (#105)。 */
	onSendBackward: () => void;
	/** 選択中の注釈がまだ前面へ動けるか。false でボタンを disable する。 */
	canBringForward: boolean;
	/** 選択中の注釈がまだ背面へ動けるか。false でボタンを disable する。 */
	canSendBackward: boolean;
	onDelete: () => void;
};

/**
 * 選択中の注釈近傍に浮かぶミニアクションバー (複製 / 前面へ / 背面へ / 削除)。
 * 種別を問わず
 * 外接矩形 (bounds) を基準に配置する。stage 内に絶対配置するが、バー自体の
 * サイズは CSS px 固定なので zoom 倍率に影響されない (stage は
 * transform-scale ではなく実寸配置のため)。
 *
 * 配置は「注釈の上」を基本とし、stage 上端で見切れるときは「注釈の下」、
 * それも収まらないときは「注釈の内側上」へフォールバックする。左右方向は
 * stage 幅に収まるよう clamp する。ドラッグ・リサイズ中の非表示は呼び側
 * (ImageStage) が isInteracting を見て制御する。
 */
export function AnnotationMiniActions({
	bounds,
	zoom,
	imageWidth,
	imageHeight,
	onDuplicate,
	onBringForward,
	onSendBackward,
	canBringForward,
	canSendBackward,
	onDelete,
}: Props) {
	const barRef = useRef<HTMLDivElement>(null);
	// 実測するまで visibility:hidden で置き、測ってから本配置する (初回
	// 1 フレームの位置ジャンプを見せない)。中身は静的なので再測不要。
	const [size, setSize] = useState<{ w: number; h: number } | null>(null);

	useLayoutEffect(() => {
		const el = barRef.current;
		if (el) {
			setSize({ w: el.offsetWidth, h: el.offsetHeight });
		}
	}, []);

	const stageW = imageWidth * zoom;
	const stageH = imageHeight * zoom;
	const barW = size?.w ?? 0;
	const barH = size?.h ?? 0;

	const boundsLeft = bounds.x * zoom;
	const boundsTop = bounds.y * zoom;
	const boundsBottom = (bounds.y + bounds.height) * zoom;

	let top = boundsTop - barH - GAP_PX;
	if (top < 0) {
		// 上に置けない → 注釈の下へ。それも stage を出るなら注釈の内側上へ。
		top =
			boundsBottom + GAP_PX + barH <= stageH
				? boundsBottom + GAP_PX
				: Math.max(0, boundsTop + GAP_PX);
	}
	const left = Math.max(0, Math.min(boundsLeft, stageW - barW));

	return (
		<div
			className="absolute flex items-center gap-0.5 rounded-md border border-border bg-card/90 p-0.5 shadow-md backdrop-blur-md"
			ref={barRef}
			role="toolbar"
			aria-label="選択中の注釈のアクション"
			style={{
				left,
				top,
				visibility: size ? "visible" : "hidden",
			}}
		>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						aria-label="選択中の注釈を複製"
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
						aria-label="選択中の注釈を前面へ"
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
						aria-label="選択中の注釈を背面へ"
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
						aria-label="選択中の注釈を削除"
						onClick={onDelete}
						size="icon-sm"
						variant="ghost"
					>
						<Trash2Icon strokeWidth={1.75} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>削除 (⌫)</TooltipContent>
			</Tooltip>
		</div>
	);
}
