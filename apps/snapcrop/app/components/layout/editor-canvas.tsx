import { ImageIcon } from "lucide-react";

export function EditorCanvas() {
	return (
		<section className="relative flex flex-1 items-center justify-center overflow-hidden p-5">
			<div className="absolute inset-5 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border text-center">
				<ImageIcon
					className="text-muted-foreground opacity-40"
					size={64}
					strokeWidth={1.5}
				/>
				<div className="flex flex-col gap-2">
					<p className="text-foreground/80 text-lg">画像をドラッグ＆ドロップ</p>
					<p className="text-muted-foreground text-sm">
						または左側のメニューから選択
					</p>
				</div>
			</div>
		</section>
	);
}
