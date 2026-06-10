import { ImageIcon, ImagePlusIcon } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { Button } from "ui";

/**
 * 画像アップロード（クリック起動のみ）。
 * 選択されたファイルは FileReader で dataURL 化して onChange に渡す。
 * 親側で localStorage と整合させる責任を持つ。
 */
export function ImageField({
	value,
	onChange,
}: {
	value: string | null;
	onChange: (next: string | null) => void;
}) {
	const inputRef = useRef<HTMLInputElement | null>(null);

	const handlePick = (file: File | undefined) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") onChange(reader.result);
		};
		reader.readAsDataURL(file);
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		handlePick(event.target.files?.[0]);
		event.target.value = "";
	};

	const openPicker = () => inputRef.current?.click();

	return (
		<div className="flex flex-col gap-2">
			{value ? (
				<div className="overflow-hidden rounded-md border border-border bg-background">
					<img
						src={value}
						alt="アップロード済み画像のプレビュー"
						className="block aspect-[1280/670] w-full object-cover"
					/>
					<div className="flex gap-px bg-border">
						<Button
							type="button"
							variant="ghost"
							className="flex-1 rounded-none font-mono text-[10px] uppercase tracking-[0.22em]"
							onClick={openPicker}
						>
							差し替え
						</Button>
						<Button
							type="button"
							variant="ghost"
							className="flex-1 rounded-none font-mono text-[10px] uppercase tracking-[0.22em] text-destructive hover:text-destructive"
							onClick={() => onChange(null)}
						>
							削除
						</Button>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={openPicker}
					className="flex h-20 w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
				>
					<span className="flex items-center gap-2 text-sm">
						<ImagePlusIcon className="size-4" strokeWidth={1.75} />
						画像を追加
					</span>
					<span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/80">
						<ImageIcon className="size-3" strokeWidth={1.75} />
						JPG / PNG ／ クリックで選択
					</span>
				</button>
			)}
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleChange}
			/>
		</div>
	);
}
