import { cn } from "takibi-design-system";

/**
 * 2 択のセグメントトグル。パネルの「通常号 / 節目号」「スクリム: 自動 / 強制」
 * 「炎マーク: 表示 / 非表示」で共通に使う。
 *
 * 副次 UI なのでブランドカラーは使わず、選択側を bg-surface-overlay と
 * line-strong のインセットリングの沈み込みで示す。
 *
 * ボタン 2 個の集まりなので、単一の `htmlFor` ではラベルと関連付けられない。
 * 外枠を `<fieldset>` にして、`aria-label` か `aria-labelledby` で名前を渡す。
 * 見えるラベルがあるときは `labelledBy` でそれを指し、無いときだけ `label` に
 * 文字列を書く（同じ文言を 2 箇所に持たないため）。`<legend>` を使わないのは、
 * 見えるラベルが Field の中で枠の外側に置かれるため。
 */
export function SegmentedToggle({
	value,
	offLabel,
	onLabel,
	onChange,
	label,
	labelledBy,
}: {
	/** true なら onLabel 側が選択されている */
	value: boolean;
	offLabel: string;
	onLabel: string;
	onChange: (next: boolean) => void;
	/** 見えるラベルが無いときのグループ名 */
	label?: string;
	/** 見えるラベルの id。あるときはこちらを使う */
	labelledBy?: string;
}) {
	return (
		<fieldset
			aria-label={labelledBy ? undefined : label}
			aria-labelledby={labelledBy}
			className="flex min-w-0 overflow-hidden rounded-md border border-line bg-surface-sunken"
		>
			<button
				type="button"
				aria-pressed={!value}
				onClick={() => onChange(false)}
				className={segmentClass(!value)}
			>
				{offLabel}
			</button>
			<button
				type="button"
				aria-pressed={value}
				onClick={() => onChange(true)}
				className={segmentClass(value)}
			>
				{onLabel}
			</button>
		</fieldset>
	);
}

function segmentClass(active: boolean): string {
	return cn(
		"flex-1 cursor-pointer border-line border-l px-2 py-2 text-sm outline-none transition-colors first:border-l-0",
		"focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset",
		"active:bg-surface-hover",
		active
			? "bg-surface-overlay text-fg-strong shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
			: "text-fg hover:bg-surface-hover",
	);
}
