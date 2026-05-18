import { SmilePlus } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "ui/components/popover";

type Props = {
	value: string;
	onChange: (value: string) => void;
	/** 絵文字ボタンのアクセシブル名 (空のとき / 選択済みのときに共通の文脈を渡す) */
	contextLabel: string;
};

/**
 * Slack のステータス入力欄を参考にした絵文字ピッカー。テキスト入力欄の
 * 左端に貼り付ける leading button として描画する想定で、自前の枠線や
 * 背景を持たない (親 wrapper 側で border + focus ring を担う)。
 *
 * フル絵文字ピッカーではなく「家事 / 勤務 / 子育て / 予定 / ペット / 気持ち」
 * のドメイン絵文字に絞り、家庭の状態管理に直接使うものだけを並べている。
 * 不足を感じたら、対応するカテゴリへ追記する。
 */
export function EmojiPicker({ value, onChange, contextLabel }: Props) {
	const [open, setOpen] = useState(false);
	const [category, setCategory] =
		useState<keyof typeof EMOJI_CATEGORIES>("家事");

	function pick(emoji: string) {
		onChange(emoji);
		setOpen(false);
	}

	const label = value
		? `絵文字 ${value} を変更する (${contextLabel})`
		: `絵文字を選ぶ (${contextLabel})`;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={label}
					className="flex h-full w-10 shrink-0 items-center justify-center rounded-l-md text-text-muted transition-colors hover:bg-bg-overlay hover:text-text-strong focus-visible:bg-bg-overlay focus-visible:text-text-strong focus-visible:outline-none"
				>
					{value ? (
						<span className="text-lg leading-none">{value}</span>
					) : (
						<SmilePlus size={18} strokeWidth={1.75} aria-hidden />
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" sideOffset={6} className="w-[320px] p-2">
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
 * 「ふたりのよてい」で実際に出てきそうな絵文字に絞ったカテゴリ。
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
