import { Trash2Icon } from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "ui";
import { useSnapcrop } from "~/contexts/snapcrop-context";

/**
 * 矩形ツール選択中だけ現れる 38px の context row。
 * Step2 ではフレームのみ。Step3 で削除ボタン配線、Step4 で style/color/thickness を埋める。
 */
export function RectToolbar() {
	const {
		image,
		activeTool,
		annotations,
		selectedAnnotationId,
		deleteAnnotation,
	} = useSnapcrop();

	if (!image || activeTool !== "rect") {
		return null;
	}

	const selected = selectedAnnotationId
		? (annotations.find((a) => a.id === selectedAnnotationId) ?? null)
		: null;
	const labelText = selected ? "選択中" : "矩形";

	return (
		<div
			className="flex h-[38px] shrink-0 items-center gap-2.5 border-border border-b bg-[var(--ink-50)] px-3.5"
			role="toolbar"
			aria-label="矩形ツールのプロパティ"
		>
			<span
				className={`font-mono text-[10px] tracking-[0.08em] uppercase ${
					selected ? "text-[var(--ember-300)]" : "text-muted-foreground"
				}`}
			>
				{labelText}
			</span>
			<Divider />

			{/* Step 4 で style / color / thickness を埋める */}
			<div aria-hidden="true" className="h-7 flex-1" />

			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.04em]">
				{annotations.length} 個の図形
			</span>

			{selected && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							aria-label="選択中の矩形を削除"
							onClick={() => deleteAnnotation(selected.id)}
							size="icon-sm"
							variant="ghost"
						>
							<Trash2Icon strokeWidth={1.75} />
						</Button>
					</TooltipTrigger>
					<TooltipContent>削除 (⌫)</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
}

function Divider() {
	return (
		<span aria-hidden="true" className="h-[18px] w-px shrink-0 bg-border" />
	);
}
