import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import {
	Calendar,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "takibi-design-system";
import { formatDateValue, parseDateValue } from "~/lib/date-value";

/**
 * 台紙に載せる日付の入力。手入力とカレンダーの両方から決める。
 *
 * 値は文字列のまま持つ。読めない文字列でも保存して台紙に出す（連載の表記は
 * 人が決めるもので、入力欄が書き換えてよいものではない）。カレンダーは
 * 読めたときだけ選択日を合わせ、読めないときは今月を開く。
 *
 * Field の中に置くと、FieldLabel が中の Input に自動で結び付く。
 */
export function DateField({
	value,
	onChange,
}: {
	value: string;
	onChange: (next: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const selected = parseDateValue(value);

	return (
		<div className="relative">
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="2026.8.16"
				className="pr-9 font-mono"
			/>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					aria-label="カレンダーから選ぶ"
					className="motion-press-glyph absolute inset-y-0 right-0 flex w-9 cursor-pointer items-center justify-center rounded-r-md text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset data-popup-open:text-brand"
				>
					<CalendarIcon className="size-4" />
				</PopoverTrigger>
				<PopoverContent align="end" className="w-auto p-0">
					<Calendar
						mode="single"
						selected={selected}
						defaultMonth={selected}
						onSelect={(date) => {
							if (!date) return;
							onChange(formatDateValue(date));
							setOpen(false);
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
