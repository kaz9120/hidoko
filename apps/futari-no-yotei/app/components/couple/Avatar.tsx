import type { User } from "~/lib/types";

type Props = {
	user: User;
	size?: number;
};

/**
 * 夫婦のイニシャルを丸チップで表示する。ユーザーの差し色 (`tone`) で塗り、
 * その色を薄めた背景で「その人らしさ」を出す。
 *
 * `--bg-overlay` を背景ベースに使う（プロトタイプの ink-100 はダーク前提の
 * 値。ライト基調の本アプリでは bg-overlay に切り替えて、ライト / ダーク両方で
 * tone が見えるようにしている）。
 */
export function Avatar({ user, size = 18 }: Props) {
	return (
		<span
			aria-hidden
			className="inline-flex shrink-0 items-center justify-center rounded-full border font-semibold"
			style={{
				width: size,
				height: size,
				fontSize: size * 0.55,
				background: `color-mix(in oklab, ${user.tone} 18%, var(--bg-overlay))`,
				color: user.tone,
				borderColor: `color-mix(in oklab, ${user.tone} 32%, transparent)`,
			}}
		>
			{user.initial}
		</span>
	);
}
