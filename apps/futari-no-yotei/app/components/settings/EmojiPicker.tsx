import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "ui/components/popover";

type Props = {
	id?: string;
	value: string;
	onChange: (value: string) => void;
	ariaLabel: string;
};

/**
 * 「ふたりのよてい」のステータス項目で頻出する絵文字を、家庭のリズムに沿った
 * 6 カテゴリにまとめたピッカー。ユーザーに絵文字を IME で打たせず、Popover の
 * グリッドから選ぶだけにする。
 *
 * フル絵文字ピッカーではなく「家事 / 勤務 / 子育て / 予定 / ペット / 気持ち」
 * のドメイン絵文字に絞っているのは、夫婦の生活で実際に使う粒度に揃えるため。
 * 不足が出てきたら、ここに追加する形で広げる。
 */
export function EmojiPicker({ id, value, onChange, ariaLabel }: Props) {
	const [open, setOpen] = useState(false);
	const [category, setCategory] =
		useState<keyof typeof EMOJI_CATEGORIES>("家事");

	function pick(emoji: string) {
		onChange(emoji);
		setOpen(false);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					id={id}
					type="button"
					aria-label={value ? `${ariaLabel}: ${value}` : ariaLabel}
					className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-bg-sunken px-3 text-sm text-text transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
				>
					{value ? (
						<span className="flex items-center gap-2">
							<span className="text-lg leading-none">{value}</span>
							<span className="text-text-faint text-xs">変更</span>
						</span>
					) : (
						<span className="text-text-faint">絵文字を選ぶ</span>
					)}
					<span aria-hidden className="text-text-faint text-xs">
						▾
					</span>
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-[320px] p-2"
				// 編集 dialog の中で開かれるが、Popover 自身の外タップで閉じることは
				// 自然な挙動 (内容の破棄ではなく選択キャンセル) なので素通し。
			>
				<div
					role="tablist"
					aria-label="絵文字のカテゴリ"
					className="mb-2 flex gap-0.5 overflow-x-auto"
				>
					{(
						Object.keys(EMOJI_CATEGORIES) as Array<
							keyof typeof EMOJI_CATEGORIES
						>
					).map((cat) => {
						const active = cat === category;
						return (
							<button
								key={cat}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setCategory(cat)}
								className="shrink-0 rounded-sm px-2 py-1 text-[11px] transition-colors"
								style={{
									color: active ? "var(--accent)" : "var(--text-muted)",
									background: active
										? "color-mix(in oklab, var(--accent) 12%, transparent)"
										: "transparent",
									fontWeight: active ? 600 : 400,
								}}
							>
								{cat}
							</button>
						);
					})}
				</div>
				<div className="grid grid-cols-8 gap-1">
					{EMOJI_CATEGORIES[category].map((emoji) => {
						const selected = emoji === value;
						return (
							<button
								key={emoji}
								type="button"
								aria-label={`絵文字 ${emoji}`}
								aria-current={selected ? "true" : undefined}
								onClick={() => pick(emoji)}
								className="flex h-9 w-9 items-center justify-center rounded-sm text-lg transition-colors hover:bg-bg-overlay focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
								style={{
									background: selected
										? "color-mix(in oklab, var(--accent) 16%, transparent)"
										: undefined,
									outline: selected
										? "1px solid color-mix(in oklab, var(--accent) 40%, transparent)"
										: undefined,
								}}
							>
								{emoji}
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}

/**
 * 「ふたりのよてい」で実際に出てきそうな絵文字に絞ったカテゴリ。フル絵文字
 * ピッカーは情報過多なので、家庭の状態管理に直接使うものだけを並べている。
 * 不足を感じたら、対応するカテゴリへ追記する。
 */
const EMOJI_CATEGORIES = {
	家事: [
		"🧹",
		"🧺",
		"🍱",
		"🍚",
		"🍳",
		"🥢",
		"🍽",
		"🗑",
		"💧",
		"🪥",
		"🧴",
		"🧼",
		"🛁",
		"🚿",
		"👕",
		"🧦",
	],
	勤務: ["👔", "💻", "🏢", "🏠", "🌙", "✈️", "🚆", "🚗", "💼", "📧", "☎️", "📞"],
	子育て: ["👶", "🚸", "🍼", "🎒", "🩹", "🎂", "📚", "🖍", "🧸", "🚼"],
	予定: [
		"📅",
		"⏰",
		"🍻",
		"☕",
		"🎉",
		"💐",
		"🎁",
		"🍷",
		"🎬",
		"🎵",
		"🎂",
		"🎄",
	],
	ペット: ["🐶", "🐱", "🐹", "🐰", "🐠", "🦜", "🐢", "🐦"],
	気持ち: ["✓", "✕", "↔︎", "⭐", "❤️", "💤", "☀️", "☁️", "🌧", "❄️", "🌸", "🍀"],
} as const satisfies Record<string, readonly string[]>;
