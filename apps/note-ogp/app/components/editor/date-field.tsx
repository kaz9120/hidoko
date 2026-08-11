import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Calendar } from "ui/components/calendar";
import { Input } from "ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "ui/components/popover";
import { formatDateValue, parseDateValue } from "~/lib/date-value";

/**
 * 台紙に載せる日付の入力。手入力とカレンダーの両方から決める。
 *
 * 値は文字列のまま持つ。読めない文字列でも保存して台紙に出す（連載の表記は
 * 人が決めるもので、入力欄が書き換えてよいものではない）。カレンダーは
 * 読めたときだけ選択日を合わせ、読めないときは今月を開く。
 */
export function DateField({
	id,
	value,
	onChange,
}: {
	id: string;
	value: string;
	onChange: (next: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const selected = parseDateValue(value);

	return (
		<div className="relative">
			<Input
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="2026.8.16"
				className="pr-9 font-mono"
			/>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						aria-label="カレンダーから選ぶ"
						className="absolute inset-y-0 right-0 flex w-9 cursor-pointer items-center justify-center rounded-r-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
					>
						<CalendarIcon className="size-4" strokeWidth={1.75} />
					</button>
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
