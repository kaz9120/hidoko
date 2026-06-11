import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "ui/components/popover";
import { PRESET_COLORS } from "~/lib/rect-engine";

const SWATCH_BASE_CLASS =
	"size-[18px] cursor-pointer rounded-full border-[1.5px] p-0 transition-transform not-disabled:hover:scale-110 disabled:cursor-not-allowed";
const SWATCH_ACTIVE_CLASS =
	"border-foreground shadow-[0_0_0_1.5px_var(--background)]";
const RAINBOW_GRADIENT =
	"conic-gradient(from 0deg, #f44, #fa3, #fd0, #4d4, #4af, #94f, #f4a, #f44)";

/**
 * 矩形ツールバーの色選択行。プリセット 6 色の円形スウォッチに加え、末尾の
 * `+` スウォッチからカスタム色を選べる。`+` は Popover でネイティブの
 * カラーピッカーと hex 入力を開く (誤操作ガード: 構造化値はピッカーを主役に
 * して、自由テキストだけにしない)。
 *
 * 現在色がプリセット外のときは `+` スウォッチがその色で塗られ、プリセットと
 * 同じ選択リングが付く。選んだ色は呼び出し側の commit を経由して
 * rectDefaults → localStorage へ永続化されるので、次回起動時も復元される。
 */
export function RectColorSwatches({
	value,
	onChange,
	disabled,
}: {
	value: string;
	onChange: (next: string) => void;
	disabled: boolean;
}) {
	const isCustom = !PRESET_COLORS.some(
		(c) => c.toLowerCase() === value.toLowerCase(),
	);

	return (
		<div
			className="inline-flex items-center gap-1.5 px-1"
			style={{ opacity: disabled ? 0.35 : 1 }}
		>
			{PRESET_COLORS.map((c) => {
				const active = value.toLowerCase() === c.toLowerCase();
				return (
					<button
						aria-pressed={active}
						aria-label={`色 ${c}`}
						className={`${SWATCH_BASE_CLASS} ${
							active ? SWATCH_ACTIVE_CLASS : "border-transparent"
						}`}
						disabled={disabled}
						key={c}
						onClick={() => onChange(c)}
						style={{ background: c }}
						type="button"
					/>
				);
			})}
			<CustomColorSwatch
				active={isCustom}
				disabled={disabled}
				onChange={onChange}
				value={value}
			/>
		</div>
	);
}

/**
 * `+` スウォッチ + カラーピッカー Popover。active (現在色がカスタム) のときは
 * 現在色で塗り、虹色グラデーションのときと同様に Plus アイコンを重ねる。
 * アイコン色は背景の明度でブラック / ホワイトを切り替える。
 */
function CustomColorSwatch({
	value,
	onChange,
	active,
	disabled,
}: {
	value: string;
	onChange: (next: string) => void;
	active: boolean;
	disabled: boolean;
}) {
	const [open, setOpen] = useState(false);

	// mosaic へ切り替えた瞬間など、disabled になったら開きっぱなしにしない
	const effectiveOpen = open && !disabled;

	return (
		<Popover onOpenChange={setOpen} open={effectiveOpen}>
			<PopoverTrigger asChild>
				<button
					aria-label={active ? `カスタム色 ${value}` : "カスタム色を選ぶ"}
					aria-pressed={active}
					className={`inline-flex items-center justify-center ${SWATCH_BASE_CLASS} ${
						active ? SWATCH_ACTIVE_CLASS : "border-transparent"
					}`}
					disabled={disabled}
					style={{ background: active ? value : RAINBOW_GRADIENT }}
					type="button"
				>
					<PlusIcon
						className={`size-2.5 ${
							active && !isLightColor(value) ? "text-white/80" : "text-black/60"
						}`}
						strokeWidth={2.5}
					/>
				</button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-44 p-3" sideOffset={8}>
				<div className="flex flex-col gap-2">
					<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
						カスタム色
					</span>
					<input
						aria-label="カラーピッカー"
						className="h-9 w-full cursor-pointer rounded-md border border-border bg-transparent p-0.5"
						onChange={(e) => onChange(e.target.value)}
						type="color"
						value={value}
					/>
					<HexColorField onCommit={onChange} value={value} />
				</div>
			</PopoverContent>
		</Popover>
	);
}

/**
 * hex 入力欄。タイプ中は draft として保持し、Enter / blur で正規化してから
 * commit する。不正な文字列は黙って現在色に巻き戻す (構造化値を壊さない)。
 */
function HexColorField({
	value,
	onCommit,
}: {
	value: string;
	onCommit: (next: string) => void;
}) {
	const [draft, setDraft] = useState(value);

	// ピッカー側で色が変わったら draft も追従させる
	useEffect(() => {
		setDraft(value);
	}, [value]);

	const commit = () => {
		const normalized = normalizeHexColor(draft);
		if (normalized) {
			onCommit(normalized);
		} else {
			setDraft(value);
		}
	};

	return (
		<Input
			aria-label="hex カラーコード"
			className="h-8 font-mono text-xs"
			onBlur={commit}
			onChange={(e) => setDraft(e.target.value)}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					commit();
				}
			}}
			placeholder="#rrggbb"
			spellCheck={false}
			value={draft}
		/>
	);
}

/**
 * `#` の有無を問わず 3 桁 / 6 桁 hex を受け付けて `#rrggbb` (lowercase) に
 * 正規化する。それ以外は null。rect-defaults-storage の検証 (`#[0-9a-f]{6}`)
 * と互換の形にそろえる。
 */
export function normalizeHexColor(raw: string): string | null {
	const body = raw.trim().replace(/^#/, "").toLowerCase();
	if (/^[0-9a-f]{6}$/.test(body)) {
		return `#${body}`;
	}
	if (/^[0-9a-f]{3}$/.test(body)) {
		return `#${body
			.split("")
			.map((ch) => ch + ch)
			.join("")}`;
	}
	return null;
}

/** 知覚輝度 (ITU-R BT.601) で「明るい色」かどうかを判定する。 */
function isLightColor(hex: string): boolean {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
		return false;
	}
	return r * 0.299 + g * 0.587 + b * 0.114 > 140;
}
