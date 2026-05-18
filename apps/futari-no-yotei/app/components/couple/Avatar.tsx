import type { User } from "~/lib/types";

type Props = {
	user: User;
	size?: number;
};

/**
 * 夫婦のイニシャルを丸チップで表示する。ユーザーの差し色 (`tone`) で塗り、
 * その色を薄めた背景で「その人らしさ」を出す。
 *
 * SR には `aria-label` で誰のアバターか伝える。隣接する文字情報 (例:
 * 「{name} さん」のラベル) で意味が既に取れている画面では、親側で
 * `<span aria-hidden>` で wrap して二重読み上げを避ける。
 *
 * `--bg-overlay` を背景ベースに使う (プロトタイプの ink-100 はダーク前提の
 * 値。ライト基調の本アプリでは bg-overlay に切り替えて、ライト / ダーク両方で
 * tone が見えるようにしている)。
 */
export function Avatar({ user, size = 18 }: Props) {
	return (
		<span
			role="img"
			aria-label={user.name}
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
			<span aria-hidden>{user.initial}</span>
		</span>
	);
}
