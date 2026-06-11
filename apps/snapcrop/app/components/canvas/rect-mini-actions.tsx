import { CopyPlusIcon, Trash2Icon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import type { RectAnnotation } from "~/lib/rect-engine";

/** 矩形とバーの間隔 (CSS px)。zoom に依存しない見た目上の距離。 */
const GAP_PX = 8;

type Props = {
	annotation: RectAnnotation;
	zoom: number;
	imageWidth: number;
	imageHeight: number;
	onDuplicate: () => void;
	onDelete: () => void;
};

/**
 * 選択中の矩形近傍に浮かぶミニアクションバー (複製 / 削除)。stage 内に
 * 絶対配置するが、バー自体のサイズは CSS px 固定なので zoom 倍率に
 * 影響されない (stage は transform-scale ではなく実寸配置のため)。
 *
 * 配置は「矩形の上」を基本とし、stage 上端で見切れるときは「矩形の下」、
 * それも収まらないときは「矩形の内側上」へフォールバックする。左右方向は
 * stage 幅に収まるよう clamp する。ドラッグ・リサイズ中の非表示は呼び側
 * (ImageStage) が isInteracting を見て制御する。
 */
export function RectMiniActions({
	annotation,
	zoom,
	imageWidth,
	imageHeight,
	onDuplicate,
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

	const rectLeft = annotation.x * zoom;
	const rectTop = annotation.y * zoom;
	const rectBottom = (annotation.y + annotation.height) * zoom;

	let top = rectTop - barH - GAP_PX;
	if (top < 0) {
		// 上に置けない → 矩形の下へ。それも stage を出るなら矩形の内側上へ。
		top =
			rectBottom + GAP_PX + barH <= stageH
				? rectBottom + GAP_PX
				: Math.max(0, rectTop + GAP_PX);
	}
	const left = Math.max(0, Math.min(rectLeft, stageW - barW));

	return (
		<div
			className="absolute flex items-center gap-0.5 rounded-md border border-border bg-card/90 p-0.5 shadow-md backdrop-blur-md"
			ref={barRef}
			role="toolbar"
			aria-label="選択中の矩形のアクション"
			style={{
				left,
				top,
				visibility: size ? "visible" : "hidden",
			}}
		>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						aria-label="選択中の矩形を複製"
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
						aria-label="選択中の矩形を削除"
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
